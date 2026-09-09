import express from "express";
import multer from "multer";

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { adminAuth } from "../config/firebase.js";
import { runZuri } from "../engine/zuriEngine.js";
import { getMusicStatus } from "../services/musicGeneration.js";
import { extractPdfText } from "../services/pdf.js";
import { generatePdf } from "../services/pdfGeneration.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generatedDir = path.join(
  __dirname,
  "..",
  "generated"
);

function wantsPdfDocument(message) {
  const text = String(message || "").toLowerCase();

  return (
    text.includes("pdf") ||
    text.includes("downloadable document") ||
    text.includes("download this") ||
    text.includes("download it") ||
    text.includes("save this as") ||
    text.includes("save it as") ||
    text.includes("export as pdf") ||
    text.includes("export this as pdf") ||
    text.includes("convert this to pdf") ||
    text.includes("convert it to pdf") ||
    text.includes("give me a pdf") ||
    text.includes("create a pdf") ||
    text.includes("make a pdf")
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
  await fs.mkdir(generatedDir, {
    recursive: true,
  });

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

  const filePath =
    path.join(
      generatedDir,
      filename
    );

  await fs.writeFile(
    filePath,
    pdfBuffer
  );

  return {
    filename,
    filePath,
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
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

/**
 * ===========================================
 * ZURI SYSTEM PROMPT
 * ===========================================
 */

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
DOCUMENT & PDF GENERATION

When the user asks you to create, write, generate, export, convert,
or download a document or PDF:

- Create the requested document content directly.
- Do NOT say that you cannot create or attach PDFs.
- Do NOT tell the user to copy the content into Word, Google Docs,
  Notes, or another application.
- Do NOT explain your limitations about PDF generation.
- The backend handles PDF generation and downloading automatically.
- Your job is to produce the actual document content.
- Return only the useful document content unless the user asks for
  an explanation.
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

      return res.status(500).json({
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
  upload.single("file"),
  async (req, res) => {
    try {
      /**
       * =========================================
       * AUTHENTICATED USER
       * =========================================
       */

      const userId =
        req.user?.uid;

      console.log(
        "🔐 Chat Firebase UID:",
        userId
      );

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

      console.log(
        "🔎 TRACE CHAT ROUTE MESSAGE:",
        message
      );

      console.log(
        "📨 Backend received message:",
        JSON.stringify(message)
      );

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

      const hasImage =
        file?.mimetype?.startsWith(
          "image/"
        ) || false;

      const hasPdf =
        file?.mimetype ===
        "application/pdf";

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
                type: "text",

                text:
                  message ||
                  "Analyze this image.",
              },

              {
                type: "image_url",

                image_url: {
                  url:
                    `data:${file.mimetype};base64,${imageBase64}`,
                },
              },
            ],
          },
        ];
      }

   // -----------------------------------------
// PDF
// -----------------------------------------

else if (hasPdf) {
  console.log("📄 PDF uploaded:", file.originalname);

  const pdfData =
    await extractPdfText(file.buffer);

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
    fileName: file.originalname,
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
${file.originalname}

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
        "👤 Authenticated user:",
        userId
      );

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

      console.log(
        "Messages sent to AI:",
        messages
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
      const response =
        await runZuri({
          message,

          userId,

          file,

          hasImage,

          hasPdf,

          messages,

          memories,

          preferences,
        });
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
      `${req.protocol}://${req.get("host")}/generated/${encodeURIComponent(
        generated.filename
      )}`;

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

      console.dir(
        response,
        {
          depth: null,
        }
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
});

    } catch (error) {
      console.error(
        "❌ Zuri chat error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Internal server error.",
      });
    }
  }
);

export default router;