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
          message:
            "Image prompt is required.",
        });
      }

      console.log(
        "🎨 HTTP IMAGE GENERATION REQUEST"
      );

      console.log(
        "🎨 Prompt:",
        prompt
      );

      const result =
        await generateImage({
          userId: req.user.uid,
          prompt,
        });

      if (!result?.success) {
        return res.status(500).json({
          success: false,
          message:
            result?.message ||
            "Image generation failed.",
        });
      }

      if (!result?.buffer) {
        return res.status(500).json({
          success: false,
          message:
            "Generated image buffer is missing.",
        });
      }

      console.log(
        "✅ Image generated and watermarked successfully."
      );

      const base64 =
        result.buffer.toString(
          "base64"
        );

      return res.json({
        success: true,

        image:
          `data:image/png;base64,${base64}`,

        mimeType:
          "image/png",

        provider:
          result.provider,

        model:
          result.model,
      });

    } catch (error) {
      console.error(
        "❌ Image generation error:",
        error
      );

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