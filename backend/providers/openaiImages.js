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
  console.log(
    "🔎 TRACE OPENAI IMAGE REQUEST:",
    {
      model: "gpt-image-2",
      size,
      quality,
    }
  );

  console.log(
    "🎨 Image provider: OpenAI"
  );

  console.log(
    "🎨 Image model: gpt-image-2"
  );

  const response =
    await getClient().images.generate({
      model: "gpt-image-2",
      prompt,
      size,
      quality,
    });

  const base64 =
    response.data?.[0]?.b64_json;

  if (!base64) {
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

    model: "gpt-image-2",

    mimeType: "image/png",

    buffer,

    imageUrl:
      `data:image/png;base64,${base64}`,
  };
}