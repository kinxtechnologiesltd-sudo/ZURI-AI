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

      if (image) {

        const base64 =
          file.buffer.toString("base64");

        const imageUrl =
          `data:${file.mimetype};base64,${base64}`;

        messages = [

          {

            role:"system",

            content:ZURI_SYSTEM_PROMPT

          },

          {

            role:"user",

            content:[

              {

                type:"text",

                text:
                  message ||
                  "Analyze this image."

              },

              {

                type:"image_url",

                image_url:{

                  url:imageUrl

                }

              }

            ]

          }

        ];

      }

      else if (pdf) {

        const pdfText =
          await extractPdfText(
            file.buffer
          );

        messages = [

          {

            role:"system",

            content:ZURI_SYSTEM_PROMPT

          },

          {

            role:"user",

            content:`

QUESTION

${message}

DOCUMENT

${pdfText}

`

          }

        ];

      }

      else {

        messages = [

          {

            role:"system",

            content:ZURI_SYSTEM_PROMPT

          },

          {

            role:"user",

            content:
              message || ""

          }

        ];

      }

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

      const stream =
        await runZuriStream({

          message,

          hasImage:image,

          hasPdf:pdf,

          messages,

          memories

        });

      const reader =
        stream.getReader();

      const decoder =
        new TextDecoder();

      while (true) {

        const {

          done,

          value

        } =
        await reader.read();

        if (done)
          break;

        const chunk =
          decoder.decode(value);

        res.write(chunk);

      }

      res.end();

    }

    catch(error){

      console.error(error);

      res.write(

        `event:error\ndata:${JSON.stringify({

          message:error.message

        })}\n\n`

      );

      res.end();

    }

  }

);

export default router;