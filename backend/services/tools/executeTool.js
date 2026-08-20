import { adminDb } from "../../config/firebase.js";

import { generateFalComic } from "../../providers/fal/comic.js";
import { generateImage } from "../imageGeneration.js";
import { generateMusic } from "../musicGeneration.js";
import { generateVideoWithAudio } from "../videoWithAudio.js";

import { conductResearch } from "../researchService.js";

import { calculatorTool } from "./calculatorTool.js";
import { pdfTool } from "./pdfTool.js";
import { searchTool } from "./searchTool.js";
import { visionTool } from "./visionTool.js";
import { weatherTool } from "./weatherTool.js";

/**
 * ===========================================
 * ULTRA-ONLY TOOLS
 * ===========================================
 */

const ULTRA_TOOLS = new Set([
  "music-generation",
  "video-generation",
  "animation",
  "comic-generation",
]);

/**
 * ===========================================
 * GET USER PLAN
 * ===========================================
 */

async function getUserPlan(userId) {
  if (!userId) {
    throw new Error(
      "Authenticated user ID is missing."
    );
  }

  const userRef = adminDb
    .collection("users")
    .doc(userId);

  const snapshot =
    await userRef.get();

  if (!snapshot.exists) {
    throw new Error(
      "Zuri user profile was not found."
    );
  }

  const data =
    snapshot.data();

  let plan =
    data.plan === "ultra"
      ? "ultra"
      : data.plan === "pro"
      ? "pro"
      : "free";

  if (
    (plan === "pro" ||
      plan === "ultra") &&
    data.subscriptionExpiresAt?.toDate
  ) {
    const expiresAt =
      data.subscriptionExpiresAt
        .toDate()
        .getTime();

    if (
      expiresAt <=
      Date.now()
    ) {
      plan = "free";
    }
  }

  return plan;
}

/**
 * ===========================================
 * CHECK TOOL ACCESS
 * ===========================================
 */

async function checkToolAccess(
  tool,
  userId
) {
  if (
    !ULTRA_TOOLS.has(tool)
  ) {
    return {
      allowed: true,
      plan: null,
    };
  }

  const plan =
    await getUserPlan(
      userId
    );

  if (plan !== "ultra") {
    return {
      allowed: false,
      plan,

      message:
        `The ${tool.replace(
          /-/g,
          " "
        )} feature is exclusive to Zuri Ultra. Please upgrade to Ultra to use it.`,
    };
  }

  return {
    allowed: true,
    plan,
  };
}

/**
 * ===========================================
 * EXECUTE TOOL
 * ===========================================
 */

export async function executeTool(
  step,
  context
) {
  const tool =
    step?.type;

  console.log(
    "🔎 TRACE EXECUTE TOOL:",
    tool
  );

  console.log(
    `🛠️ Executing tool: ${tool}`
  );

  /**
   * =========================================
   * ULTRA ACCESS CHECK
   * =========================================
   */

  const access =
    await checkToolAccess(
      tool,
      context?.userId
    );

  if (!access.allowed) {
    console.log(
      `🔒 Tool blocked: ${tool} | Plan: ${access.plan}`
    );

    return access.message;
  }

  /**
   * =========================================
   * TOOL ROUTING
   * =========================================
   */

  switch (tool) {
    /**
     * =======================================
     * RESEARCH
     * =======================================
     */

    case "research": {
      const query =
        step?.query ||
        context?.message ||
        "";

      console.log(
        "🔬 RESEARCH QUERY:",
        query
      );

      const result =
        await conductResearch({
          query,

          maxResults:
            6,

          searchDepth:
            "advanced",
        });

      console.log(
        "🔬 RESEARCH RESULT:"
      );

      console.dir(
        result,
        {
          depth: null,
        }
      );

      return JSON.stringify(
        result,
        null,
        2
      );
    }

    /**
     * =======================================
     * SEARCH
     * =======================================
     */

    case "search":
      return await searchTool(
        context
      );

    /**
     * =======================================
     * VISION
     * =======================================
     */

    case "vision":
      return await visionTool(
        context
      );

    /**
     * =======================================
     * PDF
     * =======================================
     */

    case "pdf":
      return await pdfTool(
        context
      );

    /**
     * =======================================
     * CALCULATOR
     * =======================================
     */

    case "calculator":
      return await calculatorTool(
        context
      );

    /**
     * =======================================
     * WEATHER
     * =======================================
     */

    case "weather":
      return await weatherTool(
        context
      );

    /**
     * =======================================
     * VIDEO + AUDIO
     * =======================================
     */

    case "video-generation":
    case "animation": {
      const result =
        await generateVideoWithAudio({
          prompt:
            context?.message ||
            step?.query ||
            "",

          image:
            context?.image ||
            null,

          style:
            context?.style ||
            "",

          quality:
            context?.quality ||
            "standard",
        });

      console.log(
        "🎬 VIDEO + AUDIO RESULT:",
        result
      );

      return JSON.stringify(
        result,
        null,
        2
      );
    }

    /**
     * =======================================
     * MUSIC
     * =======================================
     */

    case "music-generation": {
      const result =
        await generateMusic({
          prompt:
            context?.message ||
            step?.query ||
            "",

          style:
            context?.style ||
            "African contemporary music",
        });

      console.log(
        "🎵 MUSIC RESULT:",
        result
      );

      return JSON.stringify(
        result,
        null,
        2
      );
    }

    /**
     * =======================================
     * IMAGE
     * =======================================
     */

    case "image-generation": {
      console.log(
        "🎨 IMAGE TOOL EXECUTING:"
      );

      console.log(
        "🎨 Provider will be selected by image router."
      );

      const result =
        await generateImage({
          prompt:
            context?.message ||
            step?.query ||
            "",

          size:
            "1024x1024",

          quality:
            "high",
        });

      console.log(
        "🎨 IMAGE RESULT:",
        {
          success:
            result?.success,

          provider:
            result?.provider,

          model:
            result?.model,
        }
      );

      return JSON.stringify({
        success:
          result?.success,

        provider:
          result?.provider,

        model:
          result?.model,

        imageUrl:
          result?.imageUrl ||
          null,
      });
    }

    /**
     * =======================================
     * COMICS
     * =======================================
     */

    case "comic-generation": {
      console.log(
        "🎨 COMIC TOOL EXECUTING:"
      );

      const result =
        await generateFalComic({
          prompt:
            context?.message ||
            step?.query ||
            "",

          image:
            context?.image ||
            null,

          aspectRatio:
            context?.aspectRatio ||
            "4:3",
        });

      console.log(
        "🎨 COMIC RESULT:",
        {
          success:
            result?.success,

          provider:
            result?.provider,

          type:
            result?.type,

          hasBuffer:
            !!result?.buffer,

          hasImageUrl:
            !!result?.imageUrl,
        }
      );

      /**
       * =====================================
       * GENERATION FAILURE
       * =====================================
       */

      if (!result?.success) {
        return JSON.stringify({
          success: false,

          message:
            result?.message ||
            "Comic generation failed.",
        });
      }

      /**
       * =====================================
       * BUFFER CHECK
       * =====================================
       */

      if (!result?.buffer) {
        console.error(
          "❌ Comic buffer is missing."
        );

        return JSON.stringify({
          success: false,

          message:
            "Comic was generated but the watermarked image buffer is missing.",
        });
      }

      /**
       * =====================================
       * WATERMARKED BUFFER → DATA URL
       * =====================================
       */

      const base64 =
        result.buffer.toString(
          "base64"
        );

      const watermarkedImageUrl =
        `data:image/png;base64,${base64}`;

      console.log(
        "✅ Watermarked comic prepared for Zuri."
      );

      /**
       * =====================================
       * RETURN COMIC
       * =====================================
       */

      return JSON.stringify({
        success: true,

        provider:
          result.provider ||
          "fal",

        model:
          result.model ||
          "fal-ai/flux/schnell",

        type:
          result.type ||
          "comic",

        imageUrl:
          watermarkedImageUrl,
      });
    }

    /**
     * =======================================
     * UNKNOWN TOOL
     * =======================================
     */

    default: {
      console.warn(
        `⚠️ Unknown tool: ${tool}`
      );

      return "";
    }
  }
}