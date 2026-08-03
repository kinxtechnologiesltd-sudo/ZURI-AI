import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
// Routes
import chatRoutes from "./routes/chat.js";
import conversationRoutes from "./routes/conversation.js";
import healthRoutes from "./routes/health.js";
import imageRoutes from "./routes/image.js";
import subscriptionRoutes from "./routes/subscription.js";
import voiceRoutes from "./routes/voice.js";
dotenv.config();

// ===========================================
// FIREBASE ADMIN
// ===========================================



// ===========================================
// EXPRESS
// ===========================================

const app = express();

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
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

app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "Zuri Backend",
    version: "2.0.0",
    status: "Running",
  });
});

app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working correctly.",
  });
});// ===========================================
// ROUTES
// ===========================================

app.use("/chat", chatRoutes);

app.use("/voice", voiceRoutes);

app.use("/image", imageRoutes);

app.use("/subscription", subscriptionRoutes);

app.use("/health", healthRoutes);

app.use("/conversation", conversationRoutes);
// ===========================================
// GLOBAL ERROR HANDLER
// ===========================================

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ===========================================
// START SERVER
// ===========================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("====================================");
  console.log("🚀 Zuri Backend Started Successfully");
  console.log(`🌍 Running on http://localhost:${PORT}`);
  console.log("====================================");
});