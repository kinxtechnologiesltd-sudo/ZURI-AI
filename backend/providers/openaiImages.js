import OpenAI from "openai";
import { ENV } from "../config/environment.js";

let client;

/**
 * ===========================================
 * OpenAI Client
 * ===========================================
 */

function getClient() {
  if (!ENV.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is missing."
    );
  }

  client ||= new OpenAI({
    apiKey: ENV.OPENAI_API_KEY,
  });

  return client;
}

/**
 * ===========================================
 * OpenAI Image Generation
 * ===========================================
 */

export async function generateOpenAIImage({
  prompt,
  size = "1024x1024",
  quality = "high",
}) {
  if (!prompt?.trim()) {
    throw new Error(
      "Image prompt is required."
    );
  }

  // Use the image model available to
  // your OpenAI API project.
  const IMAGE_MODEL = "gpt-image-2";

  console.log(
    "🔎 TRACE OPENAI IMAGE REQUEST:",
    {
      model: IMAGE_MODEL,
      size,
      quality,
    }
  );

  console.log(
    "🎨 Image provider: OpenAI"
  );

  console.log(
    "🎨 Image model:",
    IMAGE_MODEL
  );

  try {
    const response =
      await getClient().images.generate({
        model: IMAGE_MODEL,
        prompt: prompt.trim(),
        size,
        quality,
      });

    const base64 =
      response.data?.[0]?.b64_json;

    if (!base64) {
      console.error(
        "❌ OpenAI image response contained no b64_json."
      );

      throw new Error(
        "OpenAI returned no image."
      );
    }

    console.log(
      "✅ IMAGE GENERATED: OpenAI returned image data"
    );

    const buffer =
      Buffer.from(
        base64,
        "base64"
      );

    return {
      success: true,

      provider: "openai",

      model: IMAGE_MODEL,

      mimeType:
        "image/png",

      buffer,

      imageUrl:
        `data:image/png;base64,${base64}`,
    };

  } catch (error) {
    console.error(
      "❌ OPENAI IMAGE GENERATION ERROR:",
      error
    );

    throw error;
  }
}
