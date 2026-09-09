import { randomUUID } from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";

import { generateLumaVideo } from "../providers/luma/video.js";
import { assembleVideoClips } from "./videoAssembler.js";
import { downloadVideo } from "./videoDownloader.js";

/**
 * =====================================================
 * ZURI LONG VIDEO GENERATION
 * =====================================================
 *
 * Luma generates individual 5s / 10s clips.
 *
 * This service:
 *
 * 1. Receives a long-video prompt
 * 2. Splits it into scenes
 * 3. Generates each scene with Luma
 * 4. Downloads each completed clip
 * 5. Joins all clips with FFmpeg
 * 6. Returns the final video
 *
 * Example:
 *
 * 60 seconds
 * → 6 × 10-second clips
 * → FFmpeg
 * → 1 × 60-second video
 */

/**
 * =====================================================
 * NORMALIZE DURATION
 * =====================================================
 */

function normalizeDuration(
  duration
) {
  const value =
    Number(
      String(duration)
        .replace("s", "")
        .trim()
    );

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return 10;
  }

  return Math.round(value);
}

/**
 * =====================================================
 * BUILD SCENES
 * =====================================================
 *
 * For now we divide the requested duration into
 * 10-second scenes.
 *
 * Later we can replace this with an AI scene planner
 * that intelligently understands the story.
 */

function buildScenes(
  prompt,
  duration
) {
  const sceneCount =
    Math.ceil(
      duration / 10
    );

  const scenes = [];

  for (
    let i = 0;
    i < sceneCount;
    i++
  ) {
    const sceneNumber =
      i + 1;

    const remaining =
      duration -
      i * 10;

    const sceneDuration =
      Math.min(
        10,
        remaining
      );

    scenes.push({
      sceneNumber,

      duration:
        sceneDuration,

      prompt: `
Create scene ${sceneNumber} of ${sceneCount}
for a continuous cinematic video.

Overall video concept:
${prompt}

This scene must last approximately
${sceneDuration} seconds.

Maintain strong visual continuity with
the overall story, characters, environment,
lighting, wardrobe and cinematic style.

Do not add unrelated scenes.

Make this scene feel like a natural part
of one continuous professional film.
      `.trim(),
    });
  }

  return scenes;
}

/**
 * =====================================================
 * GENERATE LONG VIDEO
 * =====================================================
 */

export async function generateLongVideo({
  prompt,
  duration = 60,
  aspectRatio = "16:9",
  resolution = "720p",
}) {
  if (!prompt?.trim()) {
    return {
      success: false,
      provider: "luma",
      error:
        "Video prompt is required.",
    };
  }

  const requestedDuration =
    normalizeDuration(
      duration
    );

  console.log(
    "🎬 LONG VIDEO GENERATION STARTED"
  );

  console.log(
    "🎬 Requested duration:",
    requestedDuration,
    "seconds"
  );

  /**
   * ==========================================
   * BUILD SCENES
   * ==========================================
   */

  const scenes =
    buildScenes(
      prompt,
      requestedDuration
    );

  console.log(
    "🎬 Scenes created:",
    scenes.length
  );

  scenes.forEach(
    (scene) => {
      console.log(
        `🎬 Scene ${scene.sceneNumber}: ${scene.duration}s`
      );
    }
  );

  /**
   * ==========================================
   * WORK DIRECTORY
   * ==========================================
   */

  const workDir =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        `zuri-long-video-${randomUUID()}-`
      )
    );

  const clipPaths = [];

  try {
    /**
     * ==========================================
     * GENERATE EACH SCENE
     * ==========================================
     */

    for (
      const scene of scenes
    ) {
      console.log(
        "\n======================================"
      );

      console.log(
        `🎬 GENERATING SCENE ${scene.sceneNumber}/${scenes.length}`
      );

      console.log(
        "======================================"
      );

      /**
       * Luma only accepts 5s or 10s.
       *
       * Our scene planner normally creates
       * 10-second scenes.
       */

      const lumaDuration =
        scene.duration <= 5
          ? 5
          : 10;

      const result =
        await generateLumaVideo({
          prompt:
            scene.prompt,

          aspectRatio,

          duration:
            lumaDuration,

          resolution,
        });

      if (
        !result?.success ||
        !result?.videoUrl
      ) {
        throw new Error(
          `Luma failed to generate scene ${scene.sceneNumber}. ${
            result?.error || ""
          }`
        );
      }

      console.log(
        `✅ Scene ${scene.sceneNumber} generated`
      );

      /**
       * ==========================================
       * DOWNLOAD CLIP
       * ==========================================
       */

      const filename =
        `scene-${String(
          scene.sceneNumber
        ).padStart(
          2,
          "0"
        )}.mp4`;

      const downloaded =
        await downloadVideo(
          result.videoUrl,
          {
            filename,
          }
        );

      if (
        !downloaded?.success ||
        !downloaded?.path
      ) {
        throw new Error(
          `Unable to download scene ${scene.sceneNumber}.`
        );
      }

      clipPaths.push(
        downloaded.path
      );

      console.log(
        `✅ Scene ${scene.sceneNumber} downloaded`
      );
    }

    /**
     * ==========================================
     * ASSEMBLE VIDEO
     * ==========================================
     */

    console.log(
      "\n🎞️ ALL SCENES COMPLETE"
    );

    console.log(
      "🎞️ Starting FFmpeg assembly..."
    );

    const assembled =
      await assembleVideoClips(
        clipPaths
      );

    if (
      !assembled?.success ||
      !assembled?.outputPath
    ) {
      throw new Error(
        "FFmpeg failed to assemble the video."
      );
    }

    console.log(
      "🎬 FINAL LONG VIDEO READY:",
      assembled.outputPath
    );

    /**
     * ==========================================
     * RETURN
     * ==========================================
     */

    return {
      success: true,

      provider:
        "luma",

      type:
        "long-video",

      taskId:
        null,

      duration:
        requestedDuration,

      sceneCount:
        scenes.length,

      videoPath:
        assembled.outputPath,

      videoUrl:
        null,

      scenes:
        scenes.map(
          (scene) => ({
            sceneNumber:
              scene.sceneNumber,

            duration:
              scene.duration,
          })
        ),
    };

  } catch (error) {
    console.error(
      "❌ LONG VIDEO GENERATION ERROR:",
      error
    );

    return {
      success: false,

      provider:
        "luma",

      type:
        "long-video",

      duration:
        requestedDuration,

      error:
        error instanceof Error
          ? error.message
          : "Long video generation failed.",
    };
  }
}