import { selectVideoProvider } from "../engine/videoRouter.js";

import { generateLumaVideo } from "../providers/luma/video.js";
import { generateRunwayVideo } from "../providers/runway/video.js";

import { generateLongVideo } from "./longVideoGeneration.js";

export async function generateVideo({
  prompt,
  image = null,
  style = "",
  quality = "standard",
  duration = 10,
}) {
  const requestedDuration =
    Number(duration) || 10;

  console.log(
    "🎬 Requested video duration:",
    requestedDuration,
    "seconds"
  );

  /**
   * =====================================================
   * LONG VIDEO
   * =====================================================
   *
   * Anything above 10 seconds goes through the
   * long-video pipeline.
   */

  if (
    requestedDuration > 10
  ) {
    console.log(
      "🎬 LONG VIDEO MODE ENABLED"
    );

    return await generateLongVideo({
      prompt,
      duration:
        requestedDuration,
    });
  }

  /**
   * =====================================================
   * NORMAL VIDEO
   * =====================================================
   */

  const provider =
    selectVideoProvider({
      prompt,
      image: !!image,
      style,
      quality,
    });

  console.log(
    "🎬 Selected video provider:",
    provider
  );

  switch (
    provider
  ) {
    case "runway":
      return await generateRunwayVideo({
        prompt,
        image,
        duration:
          requestedDuration,
      });

    case "luma":
      return await generateLumaVideo({
        prompt,
        duration:
          requestedDuration,
      });

    default:
      console.log(
        "⚠️ Unknown video provider. Falling back to Runway."
      );

      return await generateRunwayVideo({
        prompt,
        image,
        duration:
          requestedDuration,
      });
  }
}