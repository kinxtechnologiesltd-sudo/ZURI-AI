import sharp from "sharp";
import { addZuriWatermark } from "./services/imageWatermark.js";

async function testWatermark() {
  console.log("🧪 Creating test image...");

  const testImage = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: {
        r: 8,
        g: 18,
        b: 22,
        alpha: 1,
      },
    },
  })
    .png()
    .toBuffer();

  console.log("🧪 Applying Zuri watermark...");

  const result = await addZuriWatermark(testImage);

  await sharp(result).toFile(
    "./generated/watermark-test.png"
  );

  console.log(
    "✅ TEST COMPLETE: generated/watermark-test.png"
  );
}

testWatermark().catch((error) => {
  console.error("❌ WATERMARK TEST FAILED:");
  console.error(error);
});