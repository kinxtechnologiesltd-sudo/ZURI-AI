export function selectVideoProvider({
  prompt = "",
  image = false,
  style = "",
  quality = "standard",
}) {
  const text = `${prompt} ${style}`.toLowerCase();

  // Anime & Stylized
  if (
    text.includes("anime") ||
    text.includes("manga") ||
    text.includes("jujutsu") ||
    text.includes("demon slayer") ||
    text.includes("one piece") ||
    text.includes("naruto")
  ) {
    return "pixverse";
  }

  // Cinematic / Realistic
  if (
    text.includes("cinematic") ||
    text.includes("movie") ||
    text.includes("realistic") ||
    text.includes("hollywood")
  ) {
    return "luma";
  }

  // Fast previews
  if (
    quality === "fast" ||
    text.includes("quick") ||
    text.includes("preview")
  ) {
    return "pika";
  }

  // Image → Video
  if (image) {
    return "runway";
  }

  // Long storytelling
  if (
    text.includes("story") ||
    text.includes("scene") ||
    text.includes("film")
  ) {
    return "hailuo";
  }

  // Default
  return "runway";
}