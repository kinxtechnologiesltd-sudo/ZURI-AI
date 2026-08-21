import RunwayML, {
  TaskFailedError,
} from "@runwayml/sdk";

import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";

import fs from "fs";
import os from "os";
import path from "path";

import {
  ENV,
} from "../../config/environment.js";

const client =
  new RunwayML({
    apiKey:
      ENV.RUNWAY_API_KEY,
  });

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

/**
 * =====================================================
 * GENERATE ONE RUNWAY CLIP
 * =====================================================
 */

async function generateRunwayClip({
  prompt,
  image = null,
  duration = 10,
  ratio = "1280:720",
  seed,
}) {
  const safeDuration = Math.min(
    10,
    Math.max(2, Math.round(Number(duration) || 10))
  );

  let task;

  if (image) {
    task =
      await client.imageToVideo
        .create({
          model: "gen4.5",

          promptImage: image,

          promptText: prompt,

          duration: safeDuration,

          ratio,

          ...(seed !== undefined
            ? { seed }
            : {}),
        })
        .waitForTaskOutput();
  } else {
    task =
      await client.textToVideo
        .create({
          model: "gen4.5",

          promptText: prompt,

          duration: safeDuration,

          ratio,

          ...(seed !== undefined
            ? { seed }
            : {}),
        })
        .waitForTaskOutput();
  }

  const videoUrl =
    task?.output?.[0] || null;

  if (!videoUrl) {
    throw new Error(
      "Runway completed but did not return a video URL."
    );
  }

  console.log(
    "🎬 RUNWAY CLIP COMPLETE:",
    {
      taskId: task?.id,
      duration: safeDuration,
      videoUrl,
    }
  );

  return {
    taskId: task?.id || null,
    videoUrl,
    duration: safeDuration,
    raw: task,
  };
}

/**
 * =====================================================
 * DOWNLOAD VIDEO
 * =====================================================
 */

async function downloadVideo(
  url,
  outputPath
) {
  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to download generated video: ${response.status}`
    );
  }

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    );

  await fs.promises.writeFile(
    outputPath,
    buffer
  );

  return outputPath;
}

/**
 * =====================================================
 * STITCH VIDEO CLIPS
 * =====================================================
 */

async function stitchVideos(
  videoPaths,
  outputPath
) {
  return new Promise(
    (resolve, reject) => {
      if (!videoPaths.length) {
        return reject(
          new Error(
            "No video clips to stitch."
          )
        );
      }

      if (videoPaths.length === 1) {
        return fs.copyFile(
          videoPaths[0],
          outputPath,
          (error) => {
            if (error) {
              reject(error);
            } else {
              resolve(outputPath);
            }
          }
        );
      }

      const command =
        ffmpeg();

      for (
        const videoPath of videoPaths
      ) {
        command.input(videoPath);
      }

      command
        .on("start", (commandLine) => {
          console.log(
            "🎬 FFmpeg stitching:",
            commandLine
          );
        })

        .on("progress", (progress) => {
          console.log(
            "🎬 Stitch progress:",
            progress.percent
              ? `${progress.percent.toFixed(1)}%`
              : "processing..."
          );
        })

        .on("end", () => {
          console.log(
            "✅ VIDEO STITCHING COMPLETE:",
            outputPath
          );

          resolve(outputPath);
        })

        .on("error", (error) => {
          console.error(
            "❌ FFmpeg stitching failed:",
            error
          );

          reject(error);
        })

        .mergeToFile(
          outputPath,
          path.dirname(outputPath)
        );
    }
  );
}

/**
 * =====================================================
 * RUNWAY VIDEO GENERATION
 *
 * Supports:
 * 2–60 seconds.
 *
 * Runway itself generates max 10 seconds
 * per clip, so longer videos are stitched.
 * =====================================================
 */

export async function generateRunwayVideo({
  prompt,
  image = null,
  duration = 10,
  ratio = "1280:720",
  seed,
}) {
  let temporaryDirectory = null;

  try {
    /**
     * ==========================================
     * VALIDATE DURATION
     * ==========================================
     */

    let requestedDuration =
      Number(duration);

    if (
      !Number.isFinite(
        requestedDuration
      )
    ) {
      requestedDuration = 10;
    }

    requestedDuration =
      Math.round(
        requestedDuration
      );

    /**
     * Zuri supports up to 60 seconds.
     */

    if (
      requestedDuration < 2
    ) {
      requestedDuration = 2;
    }

    if (
      requestedDuration > 60
    ) {
      requestedDuration = 60;
    }

    console.log(
      "🎬 ZURI VIDEO REQUEST:",
      {
        requestedDuration,
        prompt,
        ratio,
        hasImage: !!image,
      }
    );

    /**
     * ==========================================
     * CALCULATE CLIPS
     * ==========================================
     *
     * Example:
     *
     * 8 sec  → 1 clip
     * 20 sec → 10 + 10
     * 35 sec → 10 + 10 + 10 + 5
     * 60 sec → 10 + 10 + 10 + 10 + 10 + 10
     */

    const clipDurations = [];

    let remaining =
      requestedDuration;

    while (remaining > 0) {
      const clipDuration =
        Math.min(
          10,
          remaining
        );

      /**
       * Runway requires at least 2 seconds.
       *
       * If the remainder is 1 second,
       * add it to the previous clip.
       */

      if (
        clipDuration === 1 &&
        clipDurations.length
      ) {
        clipDurations[
          clipDurations.length - 1
        ] += 1;

        remaining = 0;
        break;
      }

      clipDurations.push(
        clipDuration
      );

      remaining -=
        clipDuration;
    }

    console.log(
      "🎬 CLIPS REQUIRED:",
      clipDurations
    );

    /**
     * ==========================================
     * SINGLE CLIP
     * ==========================================
     */

    if (
      clipDurations.length === 1
    ) {
      const result =
        await generateRunwayClip({
          prompt,
          image,
          duration:
            clipDurations[0],
          ratio,
          seed,
        });

      return {
        success: true,

        provider:
          "runway",

        taskId:
          result.taskId,

        status:
          "SUCCEEDED",

        duration:
          requestedDuration,

        videoUrl:
          result.videoUrl,

        clipCount: 1,

        raw:
          result.raw,
      };
    }

    /**
     * ==========================================
     * MULTI-CLIP GENERATION
     * ==========================================
     */

    temporaryDirectory =
      await fs.promises.mkdtemp(
        path.join(
          os.tmpdir(),
          "zuri-runway-"
        )
      );

    const videoPaths = [];

    const tasks = [];

    /**
     * Generate clips sequentially.
     *
     * Sequential generation is intentional:
     * it prevents sending six large Runway
     * generations simultaneously.
     */

    for (
      let index = 0;
      index <
      clipDurations.length;
      index++
    ) {
      const clipDuration =
        clipDurations[index];

      console.log(
        `🎬 GENERATING CLIP ${index + 1}/${clipDurations.length}`,
        {
          duration:
            clipDuration,
        }
      );

      /**
       * Give each clip some continuity.
       */

      const clipPrompt = `
${prompt}

This is scene ${
        index + 1
      } of ${
        clipDurations.length
      }.

Maintain visual consistency with the overall concept.
Use a cinematic continuous visual style.
Avoid text overlays unless explicitly requested.
`;

      const result =
        await generateRunwayClip({
          prompt:
            clipPrompt,

          /**
           * Only use the original image
           * as the first clip's image.
           *
           * Reusing the same image for every
           * clip can cause repetitive results.
           */

          image:
            index === 0
              ? image
              : null,

          duration:
            clipDuration,

          ratio,

          /**
           * Slightly vary the seed for
           * subsequent scenes.
           */

          seed:
            seed !== undefined
              ? Number(seed) +
                index
              : undefined,
        });

      tasks.push(
        result.taskId
      );

      const clipPath =
        path.join(
          temporaryDirectory,
          `clip-${index + 1}.mp4`
        );

      console.log(
        `⬇️ DOWNLOADING CLIP ${index + 1}:`,
        result.videoUrl
      );

      await downloadVideo(
        result.videoUrl,
        clipPath
      );

      videoPaths.push(
        clipPath
      );
    }

    /**
     * ==========================================
     * STITCH ALL CLIPS
     * ==========================================
     */

    const finalVideoPath =
      path.join(
        temporaryDirectory,
        "zuri-final.mp4"
      );

    console.log(
      "🎬 STITCHING ZURI VIDEO:",
      {
        clips:
          videoPaths.length,

        requestedDuration,
      }
    );

    await stitchVideos(
      videoPaths,
      finalVideoPath
    );

    /**
     * ==========================================
     * RETURN FINAL VIDEO
     * ==========================================
     *
     * IMPORTANT:
     * The final file is temporary.
     *
     * Your chat route should copy/move it
     * into your generated media directory
     * before returning it to the frontend.
     */

    console.log(
      "✅ ZURI LONG VIDEO COMPLETE:",
      {
        duration:
          requestedDuration,

        clips:
          videoPaths.length,

        finalVideoPath,
      }
    );

    return {
      success: true,

      provider:
        "runway",

      taskId:
        tasks.join(","),

      taskIds:
        tasks,

      status:
        "SUCCEEDED",

      duration:
        requestedDuration,

      clipCount:
        videoPaths.length,

      /**
       * Local generated file.
       *
       * Your route can move this into
       * /generated before exposing it.
       */

      videoPath:
        finalVideoPath,

      videoUrl:
        null,

      message:
        `Zuri generated a ${requestedDuration}-second video using ${videoPaths.length} Runway clips.`,
    };

  } catch (error) {
    if (
      error instanceof
      TaskFailedError
    ) {
      console.error(
        "❌ Runway task failed:",
        error.taskDetails
      );

      return {
        success: false,

        provider:
          "runway",

        error:
          "Runway video generation failed.",

        details:
          error.taskDetails,
      };
    }

    console.error(
      "❌ Runway video error:",
      error
    );

    return {
      success: false,

      provider:
        "runway",

      error:
        error instanceof Error
          ? error.message
          : "Runway video generation failed.",
    };
  }
}