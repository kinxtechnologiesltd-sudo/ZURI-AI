import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

/**
 * ===========================================
 * Zuri Watermark
 * ===========================================
 */

const watermarkPath = path.join(
  __dirname,
  "../assets/zuri-watermark.png"
);

/**
 * Adds the official Zuri watermark
 * to a generated image.
 */

export async function addZuriWatermark(
  imageBuffer
) {
  console.log(
    "🎨 Loading Zuri watermark..."
  );

  const watermark =
    await sharp(watermarkPath)
      .resize({
        width: 240,
        fit: "inside",
        withoutEnlargement: true,
      })
      .png()
      .toBuffer();

  console.log(
    "🎨 Applying Zuri watermark..."
  );

  const finalImage =
    await sharp(imageBuffer)
      .composite([
        {
          input: watermark,
          gravity: "southeast",
          blend: "over",
        },
      ])
      .png()
      .toBuffer();

  console.log(
    "✅ Zuri watermark applied."
  );

  return finalImage;
}