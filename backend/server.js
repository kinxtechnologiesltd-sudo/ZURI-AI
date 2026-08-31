import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import chatRoutes from "./routes/chat.js";
import conversationRoutes from "./routes/conversation.js";
import healthRoutes from "./routes/health.js";
import imageRoutes from "./routes/image.js";
import subscriptionRoutes from "./routes/subscription.js";
import sunoRouter from "./routes/suno.js";
import voiceRoutes from "./routes/voice.js";

import { generatePdf } from "./services/pdfGeneration.js";

// ===========================================
// ENVIRONMENT
// ===========================================

dotenv.config();

console.log(
  "Flutterwave Secret Key Loaded:",
  process.env.FLW_SECRET_KEY
    ? "YES"
    : "NO"
);

// ===========================================
// EXPRESS
// ===========================================

const app = express();

// ===========================================
// PATHS
// ===========================================

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

// ===========================================
// GENERATED MEDIA DIRECTORY
// ===========================================

const generatedDirectory =
  path.join(
    __dirname,
    "generated"
  );

// Make sure the directory exists.
if (!fs.existsSync(generatedDirectory)) {
  fs.mkdirSync(
    generatedDirectory,
    {
      recursive: true,
    }
  );
}

console.log(
  "📁 Generated media directory:",
  generatedDirectory
);

// ===========================================
// CORS
// ===========================================

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Range",
    ],
    exposedHeaders: [
      "Content-Length",
      "Content-Range",
      "Accept-Ranges",
      "Content-Type",
    ],
  })
);

// ===========================================
// BODY PARSING
// ===========================================

app.use(
  express.json({
    limit: "25mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "25mb",
  })
);

// ===========================================
// FILE UPLOAD
// ===========================================

export const upload = multer({
  storage:
    multer.memoryStorage(),

  limits: {
    fileSize:
      10 * 1024 * 1024,
  },
});

// ===========================================
// GENERATED MEDIA
//
// IMPORTANT:
// We handle MP4 files ourselves so that
// browsers can use HTTP Range requests.
//
// This allows:
// - Video playback
// - Seeking
// - Scrubbing
// - Partial downloads
// - Browser streaming
// ===========================================

app.get(
  "/generated/:filename",
  async (req, res) => {
    try {
      const filename =
        path.basename(
          req.params.filename
        );

      const filePath =
        path.join(
          generatedDirectory,
          filename
        );

      console.log(
        "🎬 Generated media request:",
        filename
      );

      // =========================================
      // SECURITY
      // =========================================

      if (
        !filename ||
        filename.includes("..")
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid media filename.",
        });
      }

      // =========================================
      // FILE EXISTS?
      // =========================================

      let stat;

      try {
        stat =
          await fs.promises.stat(
            filePath
          );
      } catch {
        console.error(
          "❌ Generated media not found:",
          filePath
        );

        return res.status(404).json({
          success: false,
          error:
            "Generated media not found.",
        });
      }

      if (!stat.isFile()) {
        return res.status(404).json({
          success: false,
          error:
            "Generated media is not a file.",
        });
      }

      const fileSize =
        stat.size;

      // =========================================
      // DETERMINE CONTENT TYPE
      // =========================================

      const extension =
        path
          .extname(filename)
          .toLowerCase();

      let contentType =
        "application/octet-stream";

      if (
        extension === ".mp4"
      ) {
        contentType =
          "video/mp4";
      } else if (
        extension === ".webm"
      ) {
        contentType =
          "video/webm";
      } else if (
        extension === ".mov"
      ) {
        contentType =
          "video/quicktime";
      } else if (
        extension === ".mp3"
      ) {
        contentType =
          "audio/mpeg";
      } else if (
        extension === ".wav"
      ) {
        contentType =
          "audio/wav";
      } else if (
        extension === ".pdf"
      ) {
        contentType =
          "application/pdf";
      } else if (
        extension === ".png"
      ) {
        contentType =
          "image/png";
      } else if (
        extension === ".jpg" ||
        extension === ".jpeg"
      ) {
        contentType =
          "image/jpeg";
      }

      // =========================================
      // BASIC HEADERS
      // =========================================

      res.setHeader(
        "Content-Type",
        contentType
      );

      res.setHeader(
        "Accept-Ranges",
        "bytes"
      );

      res.setHeader(
        "Cache-Control",
        "public, max-age=3600"
      );

      res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
      );

      res.setHeader(
        "Access-Control-Expose-Headers",
        "Content-Length, Content-Range, Accept-Ranges, Content-Type"
      );

      // =========================================
      // RANGE REQUEST
      // =========================================

      const range =
        req.headers.range;

      /**
       * No Range header.
       *
       * Send the complete file.
       */

      if (!range) {
        console.log(
          "📦 Sending complete media file:",
          filename
        );

        res.setHeader(
          "Content-Length",
          fileSize
        );

        res.status(200);

        const stream =
          fs.createReadStream(
            filePath
          );

        stream.on(
          "error",
          (error) => {
            console.error(
              "❌ Media stream error:",
              error
            );

            if (
              !res.headersSent
            ) {
              res.status(500).end();
            } else {
              res.destroy(
                error
              );
            }
          }
        );

        return stream.pipe(
          res
        );
      }

      // =========================================
      // PARSE RANGE
      // =========================================

      console.log(
        "📡 Range request:",
        range
      );

      const rangeMatch =
        range.match(
          /bytes=(\d*)-(\d*)/
        );

      if (!rangeMatch) {
        res.setHeader(
          "Content-Range",
          `bytes */${fileSize}`
        );

        return res.status(416).end();
      }

      const startString =
        rangeMatch[1];

      const endString =
        rangeMatch[2];

      let start =
        startString
          ? Number(startString)
          : 0;

      let end =
        endString
          ? Number(endString)
          : fileSize - 1;

      // =========================================
      // HANDLE SUFFIX RANGE
      //
      // Example:
      // bytes=-500000
      // =========================================

      if (
        !startString &&
        endString
      ) {
        const suffixLength =
          Number(endString);

        if (
          !Number.isFinite(
            suffixLength
          ) ||
          suffixLength <= 0
        ) {
          res.setHeader(
            "Content-Range",
            `bytes */${fileSize}`
          );

          return res
            .status(416)
            .end();
        }

        start =
          Math.max(
            fileSize -
              suffixLength,
            0
          );

        end =
          fileSize - 1;
      }

      // =========================================
      // VALIDATE RANGE
      // =========================================

      if (
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        start < 0 ||
        end < start ||
        start >= fileSize
      ) {
        console.error(
          "❌ Invalid range:",
          {
            range,
            start,
            end,
            fileSize,
          }
        );

        res.setHeader(
          "Content-Range",
          `bytes */${fileSize}`
        );

        return res
          .status(416)
          .end();
      }

      // Never allow end beyond file.
      end =
        Math.min(
          end,
          fileSize - 1
        );

      const chunkSize =
        end - start + 1;

      // =========================================
      // RANGE RESPONSE
      // =========================================

      console.log(
        "📡 Sending video range:",
        {
          start,
          end,
          chunkSize,
          fileSize,
        }
      );

      res.status(206);

      res.setHeader(
        "Content-Range",
        `bytes ${start}-${end}/${fileSize}`
      );

      res.setHeader(
        "Content-Length",
        chunkSize
      );

      const stream =
        fs.createReadStream(
          filePath,
          {
            start,
            end,
          }
        );

      stream.on(
        "error",
        (error) => {
          console.error(
            "❌ Range stream error:",
            error
          );

          if (
            !res.headersSent
          ) {
            res.status(500).end();
          } else {
            res.destroy(
              error
            );
          }
        }
      );

      return stream.pipe(
        res
      );

    } catch (error) {
      console.error(
        "❌ Generated media route error:",
        error
      );

      if (
        !res.headersSent
      ) {
        return res.status(500).json({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to serve generated media.",
        });
      }

      res.end();
    }
  }
);

// ===========================================
// GENERATED MEDIA FALLBACK
//
// Keep Express static available for any
// generated files that aren't handled above.
// ===========================================

app.use(
  "/generated",
  express.static(
    generatedDirectory,
    {
      fallthrough: true,
      index: false,
    }
  )
);

// ===========================================
// ROOT
// ===========================================

app.get(
  "/",
  (req, res) => {
    res.json({
      success: true,
      name: "Zuri Backend",
      version: "2.1.0",
      status: "Running",
    });
  }
);

// ===========================================
// TEST
// ===========================================

app.get(
  "/test",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Backend is working correctly.",
    });
  }
);

// ===========================================
// MEDIA TEST
//
// Open:
// /generated-test
//
// This tells us whether Render can see
// the generated directory.
// ===========================================

app.get(
  "/generated-test",
  async (req, res) => {
    try {
      const files =
        await fs.promises.readdir(
          generatedDirectory
        );

      return res.json({
        success: true,
        generatedDirectory,
        fileCount:
          files.length,
        files:
          files.slice(
            -20
          ),
      });

    } catch (error) {
      console.error(
        "❌ Generated directory test failed:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to read generated directory.",
      });
    }
  }
);

// ===========================================
// ROUTES
// ===========================================

app.use(
  "/chat",
  chatRoutes
);

app.use(
  "/voice",
  voiceRoutes
);

app.use(
  "/image",
  imageRoutes
);

app.use(
  "/subscription",
  subscriptionRoutes
);

app.use(
  "/health",
  healthRoutes
);

app.use(
  "/suno",
  sunoRouter
);

app.use(
  "/conversation",
  conversationRoutes
);

// ===========================================
// PDF GENERATION
// ===========================================

app.post(
  "/pdf/generate",
  async (req, res) => {
    try {
      const {
        title,
        content,
      } = req.body;

      if (
        !content?.trim()
      ) {
        return res.status(400).json({
          error:
            "PDF content is required.",
        });
      }

      console.log(
        "📄 Generating PDF:",
        title ||
          "Zuri Document"
      );

      const pdfBuffer =
        await generatePdf({
          title:
            title ||
            "Zuri Document",

          content,
        });

      const filename =
        `${(
          title ||
          "zuri-document"
        )
          .replace(
            /[^a-z0-9]/gi,
            "-"
          )
          .toLowerCase()}.pdf`;

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      res.setHeader(
        "Content-Length",
        pdfBuffer.length
      );

      return res.send(
        pdfBuffer
      );

    } catch (error) {
      console.error(
        "❌ PDF GENERATION ERROR:",
        error
      );

      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "PDF generation failed.",
      });
    }
  }
);

// ===========================================
// 404 HANDLER
// ===========================================

app.use(
  (req, res) => {
    console.warn(
      "⚠️ Route not found:",
      req.method,
      req.originalUrl
    );

    res.status(404).json({
      success: false,
      message:
        "Route not found.",
      path:
        req.originalUrl,
    });
  }
);

// ===========================================
// GLOBAL ERROR HANDLER
// ===========================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      "❌ Unhandled Error:",
      err
    );

    if (
      res.headersSent
    ) {
      return next(err);
    }

    res.status(
      err.status || 500
    ).json({
      success: false,

      message:
        err.message ||
        "Internal Server Error",
    });
  }
);

// ===========================================
// START SERVER
// ===========================================

const PORT =
  process.env.PORT || 3001;

app.listen(
  PORT,
  () => {
    console.log(
      "===================================="
    );

    console.log(
      "🚀 Zuri Backend Started Successfully"
    );

    console.log(
      `🌍 Zuri Backend listening on port ${PORT}`
    );

    console.log(
      "📹 Video streaming: ENABLED"
    );

    console.log(
      "📡 HTTP Range requests: ENABLED"
    );

    console.log(
      "===================================="
    );
  }
);