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
  credentials: () => process.env.FAL_KEY,
});

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
      "🎨 FAL COMIC PROVIDER"
    );

    console.log(
      "🎨 FAL MODEL:",
      FAL_MODEL
    );

    const result =
      await fal.subscribe(
        FAL_MODEL,
        {
          input: {
            prompt: cleanPrompt,
            image_size:
              IMAGE_SIZE_BY_ASPECT_RATIO[
                aspectRatio
              ] ||
              IMAGE_SIZE_BY_ASPECT_RATIO[
                "4:3"
              ],
          },
        }
      );

    const imageUrl =
      result?.data?.images?.[0]?.url ||
      null;

    if (!imageUrl) {
      throw new Error(
        "FAL comic generation returned no image URL."
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
      status: "completed",
      imageUrl,
      raw: result?.data,
    };
  } catch (error) {
    console.error(
      "❌ FAL COMIC ERROR:",
      error
    );

    return {
      success: false,
      provider: "fal",
      type: "comic",
      error:
        error instanceof Error
          ? error.message
          : "FAL comic generation failed.",
      raw: error?.body ||
        error?.response ||
        null,
    };
  }
}
