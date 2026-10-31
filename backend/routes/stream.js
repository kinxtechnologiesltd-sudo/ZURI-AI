import express from "express";

import { upload } from "../middleware/upload.js";

import { runZuriStream } from "../engine/zuriEngine.js";

import { extractPdfText } from "../services/pdf.js";

import { isImage, isPdf } from "../utils/helpers.js";

const router = express.Router();

const ZURI_SYSTEM_PROMPT = `
You are Zuri, an advanced multimodal AI assistant created by KYNX Innovations Ltd, a technology and innovation company founded by Kingsley Joseph.
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
                type: "input_text",

                text:
                  message ||
                  "Analyze this image.",
              },

              {
                type: "input_image",

                image_url: imageUrl,
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

      // -----------------------------------------
      // ASYNC ITERABLE (OpenAI SDK stream)
      // -----------------------------------------
      if (result && typeof result[Symbol.asyncIterator] === "function") {
        try {
          for await (const event of result) {
            if (event?.type === "response.output_text.delta" && typeof event.delta === "string" && event.delta.length > 0) {
              res.write("data:" + JSON.stringify({ delta: event.delta }) + "\n\n");
            } else if (event?.type === "response.completed") {
              res.write("data:[DONE]\n\n");
            } else if (event?.type === "error") {
              res.write("event:error\ndata:" + JSON.stringify({ message: event?.message || event?.error?.message || "Streaming failed." }) + "\n\n");
              res.end();
              return;
            }
          }
          res.write("data:[DONE]\n\n");
          res.end();
          return;
        } catch (streamError) {
          console.error("OpenAI async stream error:", streamError);
          res.write("event:error\ndata:" + JSON.stringify({ message: streamError instanceof Error ? streamError.message : "Streaming failed." }) + "\n\n");
          res.end();
          return;
        }
      }

      // -----------------------------------------
      // WEB / NODE READABLE STREAM
      // -----------------------------------------
      if (result && typeof result.getReader === "function") {
        const reader = result.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          res.write(chunk);
        }
        res.end();
        return;
      }

      // -----------------------------------------
      // NON-STREAM RESPONSE OBJECT
      // -----------------------------------------
      console.log("Zuri stream returned non-stream result:", typeof result, result ? Object.keys(result) : null);
      const textContent = result?.choices?.[0]?.message?.content || result?.reply || result?.message || "";
      if (textContent) {
        res.write("data:" + JSON.stringify({ delta: textContent }) + "\n\n");
      }
      if (result?.imageUrl || result?.videoUrl || result?.audioUrl || result?.musicTaskId) {
        res.write("data:" + JSON.stringify({ type: "media", choices: result.choices || [], imageUrl: result.imageUrl || null, videoUrl: result.videoUrl || null, audioUrl: result.audioUrl || null, musicTaskId: result.musicTaskId || null, researchImages: result.researchImages || [] }) + "\n\n");
      }
      res.write("data:[DONE]\n\n");
      res.end();
      return;
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
