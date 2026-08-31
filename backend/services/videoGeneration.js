import { generateLumaVideo } from "../providers/luma/video.js";

export async function generateVideo({
  prompt,
  image = null,
  style = "",
  quality = "standard",
  duration = 10,
}) {
  console.log("🎬 VIDEO PROVIDER: LUMA ONLY");

  const fullPrompt = [
    prompt,
    style ? `Visual style: ${style}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const resolution =
    quality === "high"
      ? "1080p"
      : quality === "low"
      ? "540p"
      : "720p";

  return await generateLumaVideo({
    prompt: fullPrompt,
    image,
    aspectRatio: "16:9",
    duration,
    resolution,
  });
}