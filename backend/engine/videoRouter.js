/**
 * =====================================================
 * ZURI VIDEO PROVIDER ROUTER
 * =====================================================
 *
 * LUMA IS THE ONLY VIDEO GENERATOR.
 *
 * We still classify the user's request by style/type
 * so the rest of Zuri can understand the intent.
 *
 * However, regardless of the category, the actual
 * video provider is always Luma.
 * =====================================================
 */

export function selectVideoProvider({
  prompt = "",
  image = false,
  style = "",
  quality = "standard",
} = {}) {
  const text =
    `${prompt} ${style}`.toLowerCase();

  console.log(
    "🎬 VIDEO ROUTER ANALYZING REQUEST..."
  );

  console.log(
    "🎬 Prompt:",
    prompt
  );

  console.log(
    "🎬 Style:",
    style
  );

  console.log(
    "🎬 Quality:",
    quality
  );

  console.log(
    "🎬 Image input:",
    Boolean(image)
  );

  /**
   * =================================================
   * CLASSIFY VIDEO REQUEST
   * =================================================
   *
   * These classifications are retained because they
   * can be useful for prompt construction, logging,
   * future settings, and UI behavior.
   */

  let category = "general";

  /**
   * -----------------------------------------------
   * ANIME / MANGA
   * -----------------------------------------------
   */

  if (
    text.includes("anime") ||
    text.includes("manga") ||
    text.includes("jujutsu") ||
    text.includes("demon slayer") ||
    text.includes("one piece") ||
    text.includes("naruto")
  ) {
    category = "anime";

  /**
   * -----------------------------------------------
   * CINEMATIC / REALISTIC
   * -----------------------------------------------
   */

  } else if (
    text.includes("cinematic") ||
    text.includes("movie") ||
    text.includes("realistic") ||
    text.includes("photorealistic") ||
    text.includes("hollywood")
  ) {
    category = "cinematic";

  /**
   * -----------------------------------------------
   * FAST PREVIEW
   * -----------------------------------------------
   */

  } else if (
    quality === "fast" ||
    text.includes("quick") ||
    text.includes("preview")
  ) {
    category = "fast";

  /**
   * -----------------------------------------------
   * IMAGE → VIDEO
   * -----------------------------------------------
   */

  } else if (image) {
    category = "image-to-video";

  /**
   * -----------------------------------------------
   * STORY / FILM
   * -----------------------------------------------
   */

  } else if (
    text.includes("story") ||
    text.includes("scene") ||
    text.includes("film") ||
    text.includes("short film") ||
    text.includes("movie")
  ) {
    category = "story";

  /**
   * -----------------------------------------------
   * GENERAL VIDEO
   * -----------------------------------------------
   */

  } else {
    category = "general";
  }

  console.log(
    "🎬 VIDEO REQUEST CATEGORY:",
    category
  );

  /**
   * =================================================
   * LUMA ONLY
   * =================================================
   *
   * IMPORTANT:
   *
   * We DO NOT route these categories to different
   * providers anymore.
   *
   * Anime      → Luma
   * Cinematic  → Luma
   * Fast       → Luma
   * Image      → Luma
   * Story      → Luma
   * General    → Luma
   *
   * Luma is now Zuri's single video generation engine.
   */

  const provider = "luma";

  console.log(
    "🔥 FINAL VIDEO PROVIDER:",
    provider
  );

  return provider;
}