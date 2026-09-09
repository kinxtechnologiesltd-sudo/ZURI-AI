import express from "express";

import { upload } from "../middleware/upload.js";

import { runZuriStream } from "../engine/zuriEngine.js";

import { extractPdfText } from "../services/pdf.js";

import { isImage, isPdf } from "../utils/helpers.js";

const router = express.Router();

const ZURI_SYSTEM_PROMPT = `
You are Zuri, an advanced multimodal AI assistant created by KINX.

Always identify yourself as Zuri.

Never identify yourself as Athena.

Respond naturally.

If images or PDFs are provided, use them to answer accurately.
`;

router.post(
  "/",
  upload.single("file"),
  async (req, res) => {
    try {
      const { message } = req.body;

      const file = req.file;

      const image =
        isImage(file?.mimetype);

      const pdf =
        isPdf(file?.mimetype);

      let memories = [];

      try {
        if (req.body.memories) {
          memories = JSON.parse(
            req.body.memories
          );
        }
      } catch {}

      let messages;

      // -----------------------------------------
      // IMAGE
      // -----------------------------------------

      if (image) {
        const base64 =
          file.buffer.toString("base64");

        const imageUrl =
          `data:${file.mimetype};base64,${base64}`;

        messages = [
          {
            role: "system",

            content:
              ZURI_SYSTEM_PROMPT,
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
                  url: imageUrl,
                },
              },
            ],
          },
        ];
      }

      // -----------------------------------------
      // PDF
      // -----------------------------------------

      else if (pdf) {
        const pdfText =
          await extractPdfText(
            file.buffer
          );

        messages = [
          {
            role: "system",

            content:
              ZURI_SYSTEM_PROMPT,
          },

          {
            role: "user",

            content: `
QUESTION

${message}

DOCUMENT

${pdfText}

`,
          },
        ];
      }

      // -----------------------------------------
      // NORMAL CHAT
      // -----------------------------------------

      else {
        messages = [
          {
            role: "system",

            content:
              ZURI_SYSTEM_PROMPT,
          },

          {
            role: "user",

            content:
              message || "",
          },
        ];
      }

      // -----------------------------------------
      // SSE HEADERS
      // -----------------------------------------

      res.setHeader(
        "Content-Type",
        "text/event-stream"
      );

      res.setHeader(
        "Cache-Control",
        "no-cache"
      );

      res.setHeader(
        "Connection",
        "keep-alive"
      );

      // -----------------------------------------
      // RUN ZURI
      // -----------------------------------------

      const result =
        await runZuriStream({
          message,

          hasImage: image,

          hasPdf: pdf,

          messages,

          memories,
        });

      // -----------------------------------------
      // DIRECT MEDIA RESPONSE
      // -----------------------------------------
      //
      // runZuriStream() returns a normal object
      // for image/comic/video generation.
      //
      // A normal object does NOT have getReader().
      //
      // Send media results through SSE instead
      // of trying to treat them as a stream.
      // -----------------------------------------

      if (
        result &&
        typeof result === "object" &&
        typeof result.getReader !== "function" &&
        (
          result.imageUrl ||
          result.videoUrl ||
          result.audioUrl ||
          result.musicTaskId
        )
      ) {
        console.log(
          "🎨 STREAM DIRECT MEDIA RESPONSE:",
          {
            imageUrl:
              result.imageUrl || null,

            videoUrl:
              result.videoUrl || null,

            audioUrl:
              result.audioUrl || null,

            musicTaskId:
              result.musicTaskId || null,
          }
        );

        res.write(
          `data:${JSON.stringify({
            type: "media",

            choices:
              result.choices || [],

            imageUrl:
              result.imageUrl || null,

            videoUrl:
              result.videoUrl || null,

            audioUrl:
              result.audioUrl || null,

            musicTaskId:
              result.musicTaskId || null,

            researchImages:
              result.researchImages || [],
          })}\n\n`
        );

        res.end();

        return;
      }

      // -----------------------------------------
      // NORMAL TEXT STREAM
      // -----------------------------------------

      if (
        !result ||
        typeof result.getReader !==
          "function"
      ) {
        throw new Error(
          "Zuri stream returned an invalid response."
        );
      }

      const reader =
        result.getReader();

      const decoder =
        new TextDecoder();

      while (true) {
        const {
          done,
          value,
        } =
          await reader.read();

        if (done) {
          break;
        }

        const chunk =
          decoder.decode(value);

        res.write(chunk);
      }

      res.end();

    } catch (error) {
      console.error(
        "❌ Zuri stream error:",
        error
      );

      res.write(
        `event:error\ndata:${JSON.stringify({
          message:
            error instanceof Error
              ? error.message
              : "Internal server error.",
        })}\n\n`
      );

      res.end();
    }
  }
);

export default router;