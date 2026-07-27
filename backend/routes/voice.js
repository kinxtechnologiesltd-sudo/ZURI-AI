import express from "express";
import multer from "multer";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

/**
 * ===========================================
 * Speech → Text
 * ===========================================
 */

router.post(
  "/transcribe",
  upload.single("audio"),
  async (req, res) => {
    try {
      const audio = req.file;

      if (!audio) {
        return res.status(400).json({
          success: false,
          message: "No audio received.",
        });
      }

      const formData = new FormData();

      const blob = new Blob(
        [audio.buffer],
        {
          type:
            audio.mimetype ||
            "audio/webm",
        }
      );

      formData.append(
        "file",
        blob,
        audio.originalname || "audio.webm"
      );

      formData.append(
        "model",
        "whisper-large-v3-turbo"
      );

      const response = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          message:
            data.error?.message ||
            "Transcription failed.",
        });
      }

      res.json({
        success: true,
        text: data.text || "",
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Transcription failed.",
      });

    }
  }
);

/**
 * ===========================================
 * Text → Speech
 * ===========================================
 */

router.post(
  "/speak",
  async (req, res) => {

    try {

      let {
        text,
        voiceId,
      } = req.body;

      if (!text?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Text is required.",
        });
      }

      if (!voiceId) {
        return res.status(400).json({
          success: false,
          message: "Voice ID is required.",
        });
      }

      text = text.replace(
        /\bKINX\b/g,
        "Kinks"
      );

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "audio/mpeg",
            "xi-api-key":
              process.env.ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text,
            model_id:
              "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.55,
              similarity_boost: 0.8,
              style: 0.25,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {

        const errorText =
          await response.text();

        return res.status(response.status).json({
          success: false,
          message: errorText,
        });

      }

      const buffer = Buffer.from(
        await response.arrayBuffer()
      );

      res.set({
        "Content-Type":
          "audio/mpeg",
        "Content-Length":
          buffer.length,
      });

      res.send(buffer);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Speech generation failed.",
      });

    }

  }
);

export default router;