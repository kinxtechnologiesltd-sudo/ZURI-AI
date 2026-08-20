import cors from "cors";
import dotenv from "dotenv";
import express from "express";
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
// GENERATED MEDIA
// ===========================================

app.use(
  "/generated",
  express.static(
    path.join(
      __dirname,
      "generated"
    )
  )
);

// ===========================================
// FILE UPLOAD
// ===========================================

export const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize:
      10 * 1024 * 1024,
  },
});

// ===========================================
// MIDDLEWARE
// ===========================================

app.use(cors());

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
// ROOT
// ===========================================

app.get(
  "/",
  (req, res) => {
    res.json({
      success: true,
      name: "Zuri Backend",
      version: "2.0.0",
      status: "Running",
    });
  }
);

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
// GLOBAL ERROR HANDLER
// ===========================================
app.post("/pdf/generate", async (req, res) => {
  try {
    const {
      title,
      content,
    } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        error: "PDF content is required.",
      });
    }

    console.log(
      "📄 Generating PDF:",
      title || "Zuri Document"
    );

    const pdfBuffer =
      await generatePdf({
        title:
          title ||
          "Zuri Document",

        content,
      });

    const filename =
      `${(title || "zuri-document")
        .replace(/[^a-z0-9]/gi, "-")
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

    res.send(pdfBuffer);

  } catch (error) {
    console.error(
      "❌ PDF GENERATION ERROR:",
      error
    );

    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "PDF generation failed.",
    });
  }
});
app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      "Unhandled Error:",
      err
    );

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
      "===================================="
    );
  }
);