// engine/imageRouter.js

export function selectImageProvider({
  prompt,
  edit = false,
  quality = "high",
}) {
  const text = prompt.toLowerCase();

  // Image editing is OpenAI's strength
  if (edit) {
    return "openai";
  }

  // Anime / illustrations
  if (
    text.includes("anime") ||
    text.includes("manga") ||
    text.includes("ghibli") ||
    text.includes("demon slayer") ||
    text.includes("jujutsu") ||
    text.includes("jjk")
  ) {
    return "openai";
  }

  // Photorealistic images
  if (
    text.includes("realistic") ||
    text.includes("portrait") ||
    text.includes("photograph")
  ) {
    return "stability";
  }

  // Default
  return "openai";
}