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
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required.",
      });
    }

    const result = await generateVideo({
      prompt,
      image,
      style,
      quality,
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;