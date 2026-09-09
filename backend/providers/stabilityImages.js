import { ENV } from "../config/environment.js";

const API_URL =
  "https://api.stability.ai/v2beta/stable-image/generate/core";

const DEFAULT_SIZE = "1024x1024";
const DEFAULT_FORMAT = "webp";

export async function generateStabilityImage({
  prompt,
  size = DEFAULT_SIZE,
  outputFormat = DEFAULT_FORMAT,
}) {
  if (!ENV.STABILITY_API_KEY) {
    throw new Error(
      "STABILITY_API_KEY is missing from your environment variables."
    );
  }

  if (!prompt?.trim()) {
    throw new Error("Image prompt is required.");
  }

  const formData = new FormData();

  formData.append("prompt", prompt.trim());
  formData.append("output_format", outputFormat);

  if (size) {
    formData.append("aspect_ratio", "1:1");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.STABILITY_API_KEY}`,
      Accept: "image/*",
    },
    body: formData,
  });

  if (!response.ok) {
    let message = "Image generation failed.";

    try {
      message = await response.text();
    } catch {}

    throw new Error(message);
  }

  const imageBuffer = Buffer.from(
    await response.arrayBuffer()
  );

  return {
    success: true,
    mimeType: `image/${outputFormat}`,
    buffer: imageBuffer,
  };
}