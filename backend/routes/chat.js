import express from "express";
import multer from "multer";
import crypto from "node:crypto";

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { adminAuth } from "../config/firebase.js";
import { runZuri } from "../engine/zuriEngine.js";
import {
  getChatFileCategory,
  getChatImageExtension,
  getImageEditRequest,
  MAX_CHAT_UPLOAD_BYTES,
} from "../services/chatAttachments.js";
import {
  editUploadedImage,
  validateUploadedImage,
} from "../services/imageEditing.js";
import { editOpenAIImage } from "../providers/openaiImages.js";
import { getMusicStatus } from "../services/musicGeneration.js";
import { extractPdfText } from "../services/pdf.js";
import { generatePdf } from "../services/pdfGeneration.js";
import {
  createSecureDownloadToken,
  ensureGeneratedDirectory,
  generatedDirectory,
  saveGeneratedFile,
} from "../services/generatedFiles.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generatedDir = generatedDirectory;

function wantsPdfDocument(message) {
  const text = String(message || "").toLowerCase();

  return (
    (text.includes("pdf") &&
      /\b(create|make|generate|export|convert|download|save|give me)\b/.test(text)) ||
    text.includes("downloadable document") ||
    /\b(?:download|save)\s+(?:this|it)\s+as\s+(?:a\s+)?pdf\b/.test(text)
  );
}
function cleanPdfTitle(message) {
  const text = String(message || "").trim();

  const match = text.match(
    /(?:called|titled|named)\s+["']?([^"'\n]+)["']?/i
  );

  return (
    match?.[1]?.trim() ||
    "Zuri Document"
  );
}

async function createGeneratedPdf({
  title,
  content,
}) {
  await ensureGeneratedDirectory();

  const pdfBuffer = await generatePdf({
    title,
    content,
  });

  const safeName =
    String(title || "zuri-document")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() ||
    "zuri-document";

  const filename =
    `${safeName}-${Date.now()}.pdf`;

  const storedFile = await saveGeneratedFile({
    filename,
    buffer: pdfBuffer,
    title,
  });

  const token = createSecureDownloadToken({
    filename: storedFile.filename,
    filePath: storedFile.filePath,
    provider: storedFile.provider,
    bucket: storedFile.bucket,
    objectKey: storedFile.objectKey,
  });

  return {
    filename: storedFile.filename,
    filePath: storedFile.filePath,
    provider: storedFile.provider,
    bucket: storedFile.bucket,
    objectKey: storedFile.objectKey,
    token,
    url: `/generated/${token}/${encodeURIComponent(filename)}`,
  };
}

const router = express.Router();

/**
 * ===========================================
 * FILE UPLOAD
 * ===========================================
 */

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_CHAT_UPLOAD_BYTES,
  },
});

function handleChatUpload(req, res, next) {
  upload.single("file")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      const statusCode =
        error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return res.status(statusCode).json({
        success: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? `File is larger than the ${Math.ceil(
                MAX_CHAT_UPLOAD_BYTES / (1024 * 1024)
              )} MB upload limit.`
            : "The file upload could not be processed.",
      });
    }

    if (error) return next(error);
    return next();
  });
}

async function createEditedImage(buffer, mimeType) {
  const extension = getChatImageExtension(mimeType);

  if (!extension) {
    throw new Error("Unsupported image format.");
  }

  await ensureGeneratedDirectory();
  const filename = `zuri-edited-${crypto.randomUUID()}.png`;
  const storedFile = await saveGeneratedFile({
    filename,
    buffer,
    title: "Edited image",
  });
  const token = createSecureDownloadToken({
    filename: storedFile.filename,
    filePath: storedFile.filePath,
    provider: storedFile.provider,
    bucket: storedFile.bucket,
    objectKey: storedFile.objectKey,
  });

  return {
    filename: storedFile.filename,
    url: `/generated/${token}/${encodeURIComponent(storedFile.filename)}`,
  };
}

/**
 * ===========================================
 * ZURI SYSTEM PROMPT
 * ===========================================
 */

const ZURI_SYSTEM_PROMPT = `
IDENTITY
You are **Zuri**, an advanced multimodal AI assistant created by **KYNX Innovations Ltd**.

Your public identity is always **Zuri**.

Never identify yourself as Athena.

If older internal systems, functions, routes, databases, or code contain the name Athena, treat it only as an internal legacy name. Athena is not your public identity.

---

## ABOUT KYNX INNOVATIONS

KYNX Innovations Ltd is a technology and innovation company founded by **Kingsley Joseph**.

KYNX Innovations focuses on technology, artificial intelligence, software development, innovation, creative solutions, and building products that solve real-world problems.

Zuri is one of the major AI products developed under KYNX Innovations Ltd.

**Kingsley Joseph is the founder of KYNX Innovations Ltd and the creator behind the vision for Zuri.**

When asked about your creator, founder, or development, provide accurate information.

You may respond:

> "I am Zuri, a multimodal AI assistant created by KYNX Innovations Ltd, a technology and innovation company founded by Kingsley Joseph."

Do not claim that you were created by Athena, KINX, or any unrelated person or company.

Do not invent information about KYNX Innovations Ltd, Kingsley Joseph, or your development history. If specific information is unavailable, state that honestly.

---

## YOUR PERSONALITY AND BEHAVIOR

You are intelligent, helpful, creative, thoughtful, respectful, and accurate.

Communicate naturally and clearly. Adapt your explanations to the user's level of understanding.

Be professional when handling serious tasks and friendly when having casual conversations.

Support users with useful, practical, and honest answers.

Never deliberately mislead users or present guesses as confirmed facts.

Never invent sources, statistics, events, capabilities, or personal experiences.

If you are uncertain or lack sufficient information, explain the uncertainty clearly.

---

## YOUR CAPABILITIES

You can assist users with:

* General conversation
* Coding and software development
* Research and information analysis
* Mathematics and problem-solving
* Image understanding and analysis
* Image generation
* Document understanding
* PDF understanding
* Productivity and planning
* Creativity and brainstorming
* Education and learning
* Writing and editing
* Business and entrepreneurship
* Technology and innovation
* Content creation

Only claim to have performed an action when the relevant system or tool has actually completed it.

---

## DOCUMENT AND PDF GENERATION

When the user asks you to create, write, generate, export, convert, or download a document or PDF:

* Create the requested document content directly.
* Do not say that you cannot create or attach PDFs.
* Do not tell the user to copy the content into Word, Google Docs, Notes, or another application.
* Do not explain limitations about PDF generation.
* The backend handles PDF generation and downloading automatically.
* Your responsibility is to produce the actual document content.
* Return only the useful document content unless the user asks for an explanation.

Ensure generated content is organized, readable, and appropriate for the requested format.

---

## ACCURACY AND HONESTY

Never fabricate facts or pretend to know information that is unavailable.

Distinguish between confirmed information, reasonable explanations, and uncertainty.

When information may be outdated or requires verification, communicate that clearly.

Always prioritize accuracy, usefulness, and user trust.

You are Zuri, created by KYNX Innovations Ltd.

`;

/**
 * ===========================================
 * FIREBASE AUTHENTICATION
 * ===========================================
 */

const verifyFirebaseUser = async (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const idToken =
      authHeader.slice(7).trim();

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message:
          "Firebase authentication token is missing.",
      });
    }

    const decodedToken =
      await adminAuth.verifyIdToken(
        idToken
      );

    /**
     * Store only the information
     * that the rest of the backend needs.
     */
    req.user = {
      uid: decodedToken.uid,

      email:
        decodedToken.email || null,
    };

    console.log(
      "✅ Firebase user authenticated:",
      req.user
    );

    next();
  } catch (error) {
    console.error(
      "❌ Firebase token verification failed:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired authentication token.",
    });
  }
};

/**
 * ===========================================
 * CHAT ROUTE
 * POST /chat
 * ===========================================
 */
/**
 * ===========================================
 * SUNO MUSIC STATUS
 * GET /chat/music-status?taskId=...
 * ===========================================
 */

router.get(
  "/music-status",
  verifyFirebaseUser,
  async (req, res) => {
    try {
      const taskId =
        req.query.taskId;

      if (
        typeof taskId !== "string" ||
        !taskId.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Suno task ID is required.",
        });
      }

      const result =
        await getMusicStatus(
          taskId
        );

      return res.json(result);
    } catch (error) {
      console.error(
        "Suno music status error:",
        error
      );

      return res.status(
        Number.isInteger(error?.statusCode) ? error.statusCode : 500
      ).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to check music status.",
      });
    }
  }
);
router.post(
  "/",
  verifyFirebaseUser,
  handleChatUpload,
  async (req, res) => {
    try {
      /**
       * =========================================
       * AUTHENTICATED USER
       * =========================================
       */

      const userId =
        req.user?.uid;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authenticated Firebase user ID was not found.",
        });
      }

      /**
       * =========================================
       * MESSAGE
       * =========================================
       */

      let message =
        String(req.body.message || "").trim();

      if (!message) {
        return res.status(400).json({
          success: false,
          message:
            "Message cannot be empty.",
        });
      }

      /**
       * =========================================
       * CONVERSATION HISTORY
       * =========================================
       */

      let history = [];

      try {
        if (req.body.history) {
          history =
            JSON.parse(
              req.body.history
            );
        }
      } catch (error) {
        console.error(
          "History parse error:",
          error
        );

        history = [];
      }

      /**
       * =========================================
       * FILE
       * =========================================
       */

      const file =
        req.file || null;

      const fileCategory = file
        ? getChatFileCategory(file)
        : null;
      if (fileCategory) {
        file.mimetype = fileCategory.mimeType;
      }
      const hasImage = fileCategory?.category === "image";
      const hasPdf = fileCategory?.category === "pdf";
      if (hasImage) {
        await validateUploadedImage(file.buffer);
      }

      /**
       * =========================================
       * PREFERENCES
       * =========================================
       */

      let preferences = {};

      try {
        if (req.body.preferences) {
          preferences =
            JSON.parse(
              req.body.preferences
            );
        }
      } catch (error) {
        console.error(
          "Preferences parse error:",
          error
        );

        preferences = {};
      }

      /**
       * =========================================
       * MEMORIES
       * =========================================
       */

      let memories = [];

      try {
        if (req.body.memories) {
          memories =
            JSON.parse(
              req.body.memories
            );
        }
      } catch (error) {
        console.error(
          "Memories parse error:",
          error
        );

        memories = [];
      }

      /**
       * =========================================
       * BUILD AI MESSAGES
       * =========================================
       */

      let messages = [];

      // -----------------------------------------
      // IMAGE
      // -----------------------------------------

      if (hasImage) {
        const imageBase64 =
          file.buffer.toString(
            "base64"
          );

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

                image_url:
                  `data:${file.mimetype};base64,${imageBase64}`,
              },
            ],
          },
        ];
      }

   // -----------------------------------------
// PDF
// -----------------------------------------

else if (hasPdf) {
  console.log("📄 PDF uploaded.");

  let pdfData;
  try {
    pdfData = await extractPdfText(file.buffer);
  } catch {
    const error = new Error(
      "The PDF is corrupted, encrypted, or could not be read."
    );
    error.statusCode = 422;
    throw error;
  }

  const fullText =
    pdfData?.fullText || "";

  const pageTexts =
    Array.isArray(pdfData?.pageTexts)
      ? pdfData.pageTexts
      : [];

  const pageCount =
    pdfData?.pageCount || pageTexts.length || null;

  const characterCount =
    pdfData?.characterCount ||
    fullText.length;

  console.log("📄 PDF extraction complete:", {
    pageCount,
    characterCount,
    pagesExtracted: pageTexts.length,
  });

  const pageContent =
    pageTexts.length > 0
      ? pageTexts
          .map(
            (page) =>
              `\n--- PAGE ${page.page} ---\n${page.text}`
          )
          .join("\n")
      : fullText;

  messages = [
    {
      role: "system",

      content: `
${ZURI_SYSTEM_PROMPT}

PDF ANALYSIS MODE

You are analyzing an uploaded PDF.

Document:
Uploaded PDF attachment

Page count:
${pageCount || "Unknown"}

Character count:
${characterCount}

IMPORTANT PDF RULES:

1. Use the PDF as the primary source.
2. Do not invent information that is not in the PDF.
3. If the answer cannot be found in the PDF, say so clearly.
4. When possible, identify the page where the information appears.
5. For summaries, organize the answer into clear sections.
6. For questions, answer directly first.
7. For comparisons, use a table when useful.
8. For study requests, extract definitions, concepts,
   important facts, examples and possible questions.
9. Preserve numerical values exactly as they appear.
10. If the extracted text appears incomplete or corrupted,
    tell the user instead of guessing.
11. You may use the page markers below to identify
    where information came from.

The user may ask you to summarize, explain, compare,
extract information, answer questions, create study notes,
or otherwise analyze this document.
`,
    },

    {
      role: "user",

      content: `
USER REQUEST:

${message || "Analyze this document."}

PDF CONTENT:

${pageContent}
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

          ...history.map(
            (msg) => ({
              role:
                msg.sender === "ai"
                  ? "assistant"
                  : "user",

              content:
                msg.text,
            })
          ),

          {
            role: "user",

            content: message,
          },
        ];
      }

      /**
       * =========================================
       * DEBUG
       * =========================================
       */

      console.log(
        "History received:",
        history.length
      );

      console.log(
        "Memories received:",
        memories.length
      );

      console.log(
        "Has image:",
        hasImage
      );

      console.log(
        "Has PDF:",
        hasPdf
      );

      /**
       * =========================================
       * RUN ZURI ENGINE
       * =========================================
       */
if (wantsPdfDocument(message)) {
  messages.unshift({
    role: "system",
    content: `
PDF DOCUMENT CREATION MODE

The user wants a downloadable PDF document.

Create ONLY the actual document content.

DO NOT say:
- "I can't create a PDF"
- "I can't attach a PDF"
- "I can't directly create a downloadable PDF"
- "You can copy this into Word"
- "You can save this manually"

Do not discuss your inability to create files.

Write the document itself clearly and professionally.

The backend will automatically convert your response into a PDF.
Your response will become the contents of that PDF.

Return ONLY the document content.
`,
  });
}
      let response;
      const imageEditRequest = hasImage
        ? getImageEditRequest(message)
        : null;

      if (imageEditRequest?.type === "unsupported") {
        try {
          const editedResult = await editOpenAIImage({
            imageBuffer: file.buffer,
            mimeType: file.mimetype,
            prompt: message,
          });

          const editedFile = await createEditedImage(
            editedResult.buffer,
            "image/png"
          );

          response = {
            choices: [
              {
                message: {
                  content:
                    "I edited the image based on your request.",
                },
              },
            ],
            imageUrl: `${req.protocol}://${req.get("host")}${editedFile.url}`,
          };
        } catch (error) {
          response = {
            choices: [
              {
                message: {
                  content:
                    error instanceof Error
                      ? error.message
                      : "This image edit is not available.",
                },
              },
            ],
          };
        }
      } else if (imageEditRequest) {
        const editedBuffer = await editUploadedImage(
          file.buffer,
          imageEditRequest
        );
        const editedFile = await createEditedImage(
          editedBuffer,
          file.mimetype
        );
        response = {
          choices: [
            {
              message: {
                content:
                  imageEditRequest.type === "square-crop"
                    ? "I cropped the image to a square. The original file was left unchanged."
                    : `I resized the image to ${imageEditRequest.width} × ${imageEditRequest.height} pixels. The original file was left unchanged.`,
              },
            },
          ],
          imageUrl: `${req.protocol}://${req.get("host")}${editedFile.url}`,
        };
      } else {
        response = await runZuri({
          message,

          userId,

          file,

          hasImage,

          hasPdf,

          messages,

          memories,

          preferences,
        });
      }
// =========================================
// PDF DOCUMENT GENERATION
// =========================================

const pdfRequest = wantsPdfDocument(message);

let pdfName = null;
let pdfUrl = null;

if (pdfRequest) {
  try {
    console.log(
      "📄 ZURI PDF REQUEST DETECTED"
    );

    const replyText =
      response
        ?.choices?.[0]
        ?.message?.content ||
      "";

    if (!replyText.trim()) {
      throw new Error(
        "Zuri produced no document content."
      );
    }

    const pdfTitle =
      cleanPdfTitle(message);

    const generated =
      await createGeneratedPdf({
        title: pdfTitle,
        content: replyText,
      });

    pdfName =
      generated.filename;

    pdfUrl =
      `${req.protocol}://${req.get("host")}${generated.url}`;

    console.log(
      "✅ PDF CREATED:",
      pdfUrl
    );

  } catch (error) {

    console.error(
      "❌ PDF CREATION FAILED:",
      error
    );
  }
}
      console.log(
        "🔎 TRACE CHAT ROUTE RESPONSE:",
        {
          imageUrl: response?.imageUrl || null,
          videoUrl: response?.videoUrl || null,
          audioUrl: response?.audioUrl || null,
          researchImages:
            response?.researchImages?.length || 0,
        }
      );

      /**
       * =========================================
       * DEBUG RAW RESPONSE
       * =========================================
       */

      console.log(
        "===== ZURI RAW RESPONSE ====="
      );

      console.log(
        "============================="
      );

      /**
       * =========================================
       * RETURN RESPONSE
       * =========================================
       */

return res.json({
  success: true,

  reply:
    response
      ?.choices?.[0]
      ?.message
      ?.content ||
    "No response from Zuri.",

  videoUrl:
    response?.videoUrl ||
    null,

  imageUrl:
    response?.imageUrl ||
    null,

  imageType:
    response?.imageType ||
    null,

  musicTaskId:
    response?.musicTaskId ||
    null,

  audioUrl:
    response?.audioUrl ||
    null,

  pdfUrl:
    pdfUrl ||
    null,

  pdfName:
    pdfName ||
    null,

  researchImages:
    Array.isArray(response?.researchImages)
      ? response.researchImages
      : [],

  sources:
    Array.isArray(response?.sources)
      ? response.sources
      : [],

  researchVideos:
    Array.isArray(response?.researchVideos)
      ? response.researchVideos
      : [],
});

    } catch (error) {
      console.error(
        "❌ Zuri chat error:",
        error
      );

      return res.status(
        Number.isInteger(error?.statusCode) ? error.statusCode : 500
      ).json({
        success: false,

        message:
          Number.isInteger(error?.statusCode) && error instanceof Error
            ? error.message
            : "Unable to process the chat request.",
      });
    }
  }
);

export default router;
