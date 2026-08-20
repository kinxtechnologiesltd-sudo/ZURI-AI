import { selectVideoProvider } from "../engine/videoRouter.js";

import { generateLumaVideo } from "../providers/luma/video.js";
import { generateRunwayVideo } from "../providers/runway/video.js";

// We'll add these providers next
// import { generatePixVerseVideo } from "../providers/pixverse/video.js";
// import { generatePikaVideo } from "../providers/pika/video.js";
// import { generateHailuoVideo } from "../providers/hailuo/video.js";

export async function generateVideo({
  prompt,
  image = null,
  style = "",
  quality = "standard",
}) {
  const provider = selectVideoProvider({
    prompt,
    image: !!image,
    style,
    quality,
  });

  console.log(
    "🎬 Selected video provider:",
    provider
  );

  switch (provider) {
    case "runway":
      return await generateRunwayVideo({
        prompt,
        image,
      });

    case "luma":
      return await generateLumaVideo({
        prompt,
      });

    // We'll enable these as we integrate them

    // case "pixverse":
    //   return await generatePixVerseVideo({
    //     prompt,
    //     image,
    //   });

    // case "pika":
    //   return await generatePikaVideo({
    //     prompt,
    //     image,
    //   });

    // case "hailuo":
    //   return await generateHailuoVideo({
    //     prompt,
    //     image,
    //   });

    default:
      console.log(
        "⚠️ Unknown video provider. Falling back to Runway."
      );

      return await generateRunwayVideo({
        prompt,
        image,
      });
  }
}