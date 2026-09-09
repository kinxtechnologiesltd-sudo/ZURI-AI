import { fal } from "@fal-ai/client";
import dotenv from "dotenv";
import sharp from "sharp";
import { addZuriWatermark } from "../services/imageWatermark.js";

dotenv.config();

const FAL_MODEL = "fal-ai/flux/schnell";

function getFalClient() {
  if (!process.env.FAL_KEY) {
    throw new Error("FAL_KEY is missing.");
  }

  fal.config({
    credentials: process.env.FAL_KEY,
  });

  return fal;
}

export async function generateFalComic({
  prompt,
  imageSize = "square_hd",
}) {
  if (!prompt?.trim()) {
    throw new Error("Comic prompt is required.");
  }

  console.log("🎨 FAL COMIC GENERATION");
  console.log("🎨 Model:", FAL_MODEL);
  console.log("🎨 Prompt:", prompt);

  const client = getFalClient();

  const result = await client.subscribe(
    FAL_MODEL,
    {
      input: {
        prompt,
        image_size: imageSize,
        num_images: 1,
      },

      logs: true,

      onQueueUpdate: (update) => {
        if (
          update.status === "IN_PROGRESS" &&
          update.logs
        ) {
          update.logs.forEach((log) => {
            console.log(
              "🎨 FAL:",
              log.message
            );
          });
        }
      },
    }
  );

  const imageUrl =
    result?.data?.images?.[0]?.url;

  if (!imageUrl) {
    console.error(
      "❌ FAL RESPONSE:",
      result?.data
    );

    throw new Error(
      "Fal returned no comic image."
    );
  }

  console.log(
    "✅ FAL comic generated."
  );

  const response =
    await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(
      "Failed to download Fal image."
    );
  }

  const arrayBuffer =
    await response.arrayBuffer();

  const buffer =
    Buffer.from(arrayBuffer);

  const pngBuffer =
    await sharp(buffer)
      .png()
      .toBuffer();

  console.log(
    "✅ FAL comic converted to PNG."
  );

  // =========================================
  // ZURI WATERMARK
  // =========================================

  console.log(
    "🎨 Applying Zuri watermark to comic..."
  );

  const watermarkedBuffer =
    await addZuriWatermark(
      pngBuffer
    );

  console.log(
    "✅ Zuri watermark applied to comic."
  );

  return {
    success: true,

    provider: "fal",

    model: FAL_MODEL,

    mimeType: "image/png",

    buffer: watermarkedBuffer,

    imageUrl:
      `data:image/png;base64,` +
      watermarkedBuffer.toString(
        "base64"
      ),
  };
}