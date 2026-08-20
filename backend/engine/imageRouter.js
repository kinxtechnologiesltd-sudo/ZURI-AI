// engine/imageRouter.js

export function selectImageProvider({
  prompt,
  edit = false,
  quality = "high",
}) {
  const text = (prompt || "").toLowerCase();

  // =========================================
  // IMAGE EDITING
  // =========================================
  // Keep editing on OpenAI for now.

  if (edit) {
    console.log(
      "🧭 IMAGE ROUTER: Edit → OpenAI"
    );

    return "openai";
  }

  // =========================================
  // COMIC DETECTION
  // =========================================

  const comicKeywords = [
    "comic",
    "comics",
    "comic book",
    "comic-book",
    "comicbook",
    "graphic novel",
    "graphic-novel",
    "manga",
    "manga panel",
    "comic panel",
    "comic panels",
    "comic strip",
    "webcomic",
    "web comic",
    "storyboard",
    "illustrated story",
    "comic illustration",
  ];

  const isComic = comicKeywords.some(
    (keyword) => text.includes(keyword)
  );

  if (isComic) {
    console.log(
      "🧭 IMAGE ROUTER: Comic → Fal"
    );

    return "fal";
  }

  // =========================================
  // ANIME / SPECIALIZED ILLUSTRATION
  // =========================================
  // Keep these on OpenAI for now.

  if (
    text.includes("anime") ||
    text.includes("ghibli") ||
    text.includes("demon slayer") ||
    text.includes("jujutsu") ||
    text.includes("jjk")
  ) {
    console.log(
      "🧭 IMAGE ROUTER: Anime/Illustration → OpenAI"
    );

    return "openai";
  }

  // =========================================
  // DEFAULT IMAGE GENERATION
  // =========================================

  console.log(
    "🧭 IMAGE ROUTER: Normal image → OpenAI"
  );

  return "openai";
}