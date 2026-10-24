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
import {
  ensureGeneratedDirectory,
  getSecureDownloadEntry,
  generatedDirectory,
  readGeneratedFileStream,
} from "./services/generatedFiles.js";

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

export const app = express();

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

await ensureGeneratedDirectory();

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
// GENERATED MEDIA WITH SECURE TOKEN ACCESS
// ===========================================

app.get(
  "/generated/:token/:filename",
  async (req, res) => {
    try {
      const token = String(req.params.token || "").trim();
      const filename = path.basename(String(req.params.filename || ""));

      if (!token || !filename || filename.includes("..")) {
        return res.status(400).json({
          success: false,
          error: "Invalid download token or filename.",
        });
      }

      const entry = getSecureDownloadEntry(token, filename);

      if (!entry) {
        return res.status(403).json({
          success: false,
          error: "This file link is invalid or expired.",
        });
      }

      let stream;
      let contentType;
      let contentLength;

      if (entry.provider === "local") {
        const filePath = entry.filePath;
        const stat = await fs.promises.stat(filePath);

        if (!stat.isFile()) {
          return res.status(404).json({
            success: false,
            error: "Generated media is not a file.",
          });
        }

        stream = fs.createReadStream(filePath);
        contentType = path.extname(filename).toLowerCase() === ".pdf"
          ? "application/pdf"
          : path.extname(filename).toLowerCase() === ".png"
            ? "image/png"
            : path.extname(filename).toLowerCase() === ".jpg" || path.extname(filename).toLowerCase() === ".jpeg"
              ? "image/jpeg"
              : path.extname(filename).toLowerCase() === ".mp4"
                ? "video/mp4"
                : "application/octet-stream";
        contentLength = stat.size;
      } else {
        const r2Response = await readGeneratedFileStream(entry);
        stream = r2Response.stream;
        contentType = r2Response.contentType || "application/octet-stream";
        contentLength = r2Response.size || 0;
      }

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Cache-Control", "private, no-store");
      if (contentLength > 0) {
        res.setHeader("Content-Length", contentLength);
      }

      stream.on("error", (error) => {
        console.error("❌ Secure PDF stream error:", error);
        if (!res.headersSent) {
          res.status(500).end();
        } else {
          res.destroy(error);
        }
      });

      return stream.pipe(res);
    } catch (error) {
      console.error("❌ Secure generated file request failed:", error);
      return res.status(500).json({
        success: false,
        error: "Unable to serve the requested generated file.",
      });
    }
  }
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
// START SERVER WHEN RUN DIRECTLY
// ===========================================

const PORT =
  process.env.PORT || 3001;

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
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
}