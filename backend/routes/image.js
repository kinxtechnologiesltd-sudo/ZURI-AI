import express from "express";
import { verifyFirebaseUser } from "../middleware/auth.js";
import { generateImage } from "../services/imageGeneration.js";

const router = express.Router();

/**
 * ===========================================
 * Image Generation
 * POST /image/generate
 * ===========================================
 */

router.post(
  "/generate",
  verifyFirebaseUser,
  async (req, res) => {

    try {

      const { prompt } = req.body;

      if (!prompt?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Image prompt is required.",
        });
      }

      console.log("🎨 Prompt:", prompt);

      const result = await generateImage(prompt);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message:
            result.message ||
            "Image generation failed.",
        });
      }

      return res.json({
        success: true,
        image: `data:${result.mimeType};base64,${result.buffer.toString("base64")}`,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Image generation failed.",
      });

    }

  }
);

export default router;