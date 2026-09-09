import { fal } from "@fal-ai/client";
import dotenv from "dotenv";

dotenv.config();

const FAL_MODEL =
  "fal-ai/flux-2-lora-gallery/digital-comic-art";

const IMAGE_SIZE_BY_ASPECT_RATIO = {
  "4:3": "landscape_4_3",
  "3:4": "portrait_4_3",
  "16:9": "landscape_16_9",
  "9:16": "portrait_16_9",
};

fal.config({
  credentials: () => {
    const key = String(
      process.env.FAL_KEY || ""
    ).trim();

    if (!key) {
      throw new Error(
        "FAL_KEY is missing from environment variables."
      );
    }

    return key;
  },
});

/**
 * =====================================================
 * FAL COMIC GENERATION
 * =====================================================
 */

export async function generateFalComic({
  prompt,
  image = null,
  aspectRatio = "4:3",
}) {
  try {
    const cleanPrompt =
      String(prompt || "").trim();

    if (!cleanPrompt) {
      throw new Error(
        "Comic prompt is required."
      );
    }

    console.log(
      "🎨 ========================================"
    );

    console.log(
      "🎨 FAL COMIC PROVIDER"
    );

    console.log(
      "🎨 FAL MODEL:",
      FAL_MODEL
    );

    console.log(
      "🎨 FAL KEY:",
      process.env.FAL_KEY
        ? "LOADED"
        : "MISSING"
    );

    console.log(
      "🎨 ASPECT RATIO:",
      aspectRatio
    );

    console.log(
      "🎨 IMAGE PROVIDED:",
      Boolean(image)
    );

    console.log(
      "🎨 PROMPT:",
      cleanPrompt
    );

    /**
     * ================================================
     * BUILD INPUT
     * ================================================
     */

    const input = {
      prompt: cleanPrompt,

      image_size:
        IMAGE_SIZE_BY_ASPECT_RATIO[
          aspectRatio
        ] ||
        IMAGE_SIZE_BY_ASPECT_RATIO[
          "4:3"
        ],
    };

    /**
     * If an image was supplied, pass it through.
     *
     * The exact input field expected by the
     * Fal model is image_url.
     */

    if (
      typeof image === "string" &&
      image.trim()
    ) {
      input.image_url =
        image.trim();
    }

    console.log(
      "🎨 FAL INPUT:"
    );

    console.dir(
      input,
      {
        depth: null,
      }
    );

    /**
     * ================================================
     * CALL FAL
     * ================================================
     */

    console.log(
      "🎨 Sending request to Fal..."
    );

    const result =
      await fal.subscribe(
        FAL_MODEL,
        {
          input,

          logs: true,

          onQueueUpdate: (
            update
          ) => {
            console.log(
              "🎨 FAL QUEUE UPDATE:",
              update
            );
          },
        }
      );

    /**
     * ================================================
     * RAW RESULT
     * ================================================
     */

    console.log(
      "🎨 FAL REQUEST COMPLETED"
    );

    console.log(
      "🎨 FAL REQUEST ID:",
      result?.requestId ||
        "none"
    );

    console.log(
      "🎨 FAL RESULT:"
    );

    console.dir(
      result,
      {
        depth: null,
      }
    );

    /**
     * ================================================
     * EXTRACT IMAGE
     * ================================================
     */

    const imageUrl =
      result?.data?.images?.[0]?.url ||
      result?.data?.image?.url ||
      result?.data?.output?.[0]?.url ||
      result?.images?.[0]?.url ||
      null;

    console.log(
      "🎨 EXTRACTED IMAGE URL:",
      imageUrl
    );

    if (!imageUrl) {
      throw new Error(
        "FAL comic generation completed but returned no usable image URL."
      );
    }

    console.log(
      "✅ FAL COMIC READY"
    );

    console.log(
      "🖼️ FAL IMAGE URL:",
      imageUrl
    );

    return {
      success: true,

      provider: "fal",

      type: "comic",

      taskId:
        result?.requestId ||
        null,

      status:
        "completed",

      imageUrl,

      raw:
        result?.data ||
        result,
    };

  } catch (error) {
    console.error(
      "❌ ========================================"
    );

    console.error(
      "❌ FAL COMIC ERROR"
    );

    console.error(
      error
    );

    console.error(
      "❌ MESSAGE:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    console.error(
      "❌ ========================================"
    );

    return {
      success: false,

      provider: "fal",

      type: "comic",

      error:
        error instanceof Error
          ? error.message
          : "FAL comic generation failed.",

      raw:
        error?.body ||
        error?.response ||
        error ||
        null,
    };
  }
}