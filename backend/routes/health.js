import express from "express";

const router = express.Router();

/**
 * ===========================================
 * HEALTH CHECK
 * GET /health
 * ===========================================
 */

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Zuri Backend",
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "2.0.0",
  });
});

/**
 * ===========================================
 * API STATUS
 * GET /health/status
 * ===========================================
 */

router.get("/status", (req, res) => {
  res.json({
    success: true,
    services: {
      backend: true,
      groq: !!process.env.GROQ_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      tavily: !!process.env.TAVILY_API_KEY,
      firebase: true,
    },
  });
});

export default router;