import express from "express";
import { generateVideo } from "../services/videoGeneration.js";

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const {
      prompt,
      image = null,
      style = "",
      quality = "standard",
      duration = 10,
    } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required.",
      });
    }

    console.log(
      "🎬 HTTP VIDEO GENERATION REQUEST"
    );

    console.log(
      "🎬 Requested duration:",
      duration,
      "seconds"
    );

    const result = await generateVideo({
      prompt,
      image,
      style,
      quality,
      duration,
    });

    if (!result?.success) {
      return res.status(500).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error(
      "❌ Video generation error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Video generation failed.",
    });
  }
});

export default router;