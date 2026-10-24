import { selectImageProvider } from "../engine/imageRouter.js";
import { generateFalComic } from "../providers/falComics.js";
import { generateOpenAIImage } from "../providers/openaiImages.js";
import { addZuriWatermark } from "./imageWatermark.js";

/**
 * ===========================================
 * ZURI IMAGE GENERATION SERVICE
 * ===========================================
 *
 * Normal images:
 *   Brain → OpenAI → Watermark
 *
 * Comics:
 *   Brain → Fal → Watermark
 *
 * Both providers return the same structure,
 * so the rest of Zuri doesn't need to care
 * which provider was used.
 */

export async function generateImage({
  prompt,
  size = "1024x1024",
  quality = "high",
  edit = false,
}) {
  if (!prompt?.trim()) {
    throw new Error("Image prompt is required.");
  }

  console.log(
    "🎨 IMAGE GENERATION STARTED"
  );

  console.log(
    "🎨 Prompt:",
    prompt
  );

  // =========================================
  // SELECT PROVIDER
  // =========================================

  const provider =
    selectImageProvider({
      prompt,
      edit,
      quality,
    });

  console.log(
    "🎨 Selected image provider:",
    provider
  );

  let result;

  // =========================================
  // OPENAI
  // =========================================

  if (provider === "openai") {
    console.log(
      "🎨 Sending image request to OpenAI..."
    );

    result =
      await generateOpenAIImage({
        prompt,
        size,
        quality,
      });

    if (result?.success) {
      console.log(
        "✅ OpenAI image generated successfully."
      );
    }
  }

  // =========================================
  // FAL — COMICS
  // =========================================

  else if (provider === "fal") {
    console.log(
      "🎨 Sending comic request to Fal..."
    );

    result =
      await generateFalComic({
        prompt,
      });

    if (result?.success) {
      console.log(
        "✅ Fal comic generated successfully."
      );
    }
  }

  // =========================================
  // UNKNOWN PROVIDER
  // =========================================

  else {
    throw new Error(
      `Unsupported image provider: ${provider}`
    );
  }

  // =========================================
  // VALIDATE RESULT
  // =========================================

  if (!result?.success) {
    throw new Error(
      result?.message ||
        "Image generation failed."
    );
  }

  if (!result?.buffer) {
    throw new Error(
      "Image provider returned no image buffer."
    );
  }

  // =========================================
  // WATERMARK
  // =========================================
  //
  // IMPORTANT:
  //
  // Our Fal provider already applies the
  // watermark in falComics.js.
  //
  // OpenAI does NOT apply it there.
  //
  // Therefore:
  //
  // OpenAI → watermark here
  // Fal    → already watermarked
  //
  // This prevents a DOUBLE watermark.
  // =========================================

  let finalBuffer;

  if (provider === "openai") {
    console.log(
      "🎨 Applying Zuri watermark to OpenAI image..."
    );

    finalBuffer =
      await addZuriWatermark(
        result.buffer
      );

    console.log(
      "✅ Zuri watermark applied."
    );
  } else {
    console.log(
      "✅ Fal image already contains Zuri watermark."
    );

    finalBuffer =
      result.buffer;
  }

  // =========================================
  // BASE64
  // =========================================

  const base64 =
    finalBuffer.toString(
      "base64"
    );

  // =========================================
  // RETURN
  // =========================================

  return {
    ...result,

    success: true,

    provider,

    model:
      provider === "fal"
        ? "fal-ai/flux/schnell"
        : "gpt-image-2",

    mimeType:
      "image/png",

    buffer:
      finalBuffer,

    imageUrl:
      `data:image/png;base64,${base64}`,
  };
}