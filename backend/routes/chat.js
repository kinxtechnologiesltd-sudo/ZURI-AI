import express from "express";
import multer from "multer";

import { runZuri } from "../engine/zuriEngine.js";
import { extractPdfText } from "../services/pdf.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const ZURI_SYSTEM_PROMPT = `
IDENTITY

You are Zuri, an advanced multimodal AI assistant created by KINX.

Your public identity is always Zuri.

Never identify yourself as Athena.

If older internal systems, functions, routes or code contain the name Athena, treat it only as an internal legacy name.

You are intelligent, helpful, creative and accurate.

You can assist with:

- Conversation
- Coding
- Research
- Mathematics
- Images
- Documents
- Productivity
- Creativity
- Education

Never invent facts.

If information is unavailable, say so honestly.
`;

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const message = req.body.message || "";

    let history = [];

    try {
      if (req.body.history) {
        history = JSON.parse(req.body.history);
      }
    } catch (err) {
      console.error("History parse error:", err);
    }

    const file = req.file || null;

    let preferences = {};
    let memories = [];

    try {
      if (req.body.preferences) {
        preferences = JSON.parse(req.body.preferences);
      }
    } catch {}

    try {
      if (req.body.memories) {
        memories = JSON.parse(req.body.memories);
      }
    } catch {}

    const hasImage =
      file?.mimetype?.startsWith("image/");

    const hasPdf =
      file?.mimetype === "application/pdf";

    let messages = [];

    if (hasImage) {
      const imageBase64 =
        file.buffer.toString("base64");

      messages = [
        {
          role: "system",
          content: ZURI_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                message ||
                "Analyze this image.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${file.mimetype};base64,${imageBase64}`,
              },
            },
          ],
        },
      ];
    } else if (hasPdf) {
      const pdfText =
        await extractPdfText(file.buffer);

      messages = [
        {
          role: "system",
          content: ZURI_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `
USER QUESTION

${message || "Analyze this document."}

PDF CONTENT

${pdfText}
`,
        },
      ];
    } else {
      messages = [
        {
          role: "system",
          content: ZURI_SYSTEM_PROMPT,
        },

        ...history.map((msg) => ({
          role:
            msg.sender === "ai"
              ? "assistant"
              : "user",
          content: msg.text,
        })),

        {
          role: "user",
          content: message,
        },
      ];
    }

    console.log("History received:", history.length);
    console.log("Messages sent to AI:", messages);

const response = await runZuri({
  message,
  file,
  hasImage,
  hasPdf,
  messages,
  memories,
  preferences,
});

console.log("===== ZURI RAW RESPONSE =====");
console.dir(response, { depth: null });
console.log("=============================");

    return res.json({
      reply:
        response?.choices?.[0]?.message
          ?.content ||
        "No response from Zuri.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Internal server error.",
    });
  }
});

export default router;