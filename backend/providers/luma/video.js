import { ENV } from "../../config/environment.js";

import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";

import fs from "fs";
import os from "os";
import path from "path";

const BASE_URL =
  "https://agents.lumalabs.ai/v1";

console.log(
  "🔥 LUMA AGENTS VIDEO PROVIDER LOADED"
);

// =====================================================
// FFmpeg
// =====================================================

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

// =====================================================
// GET LUMA GENERATION STATUS
// =====================================================

export async function getLumaVideoStatus(taskId) {
  try {
    const apiKey =
      String(ENV.LUMA_API_KEY || "").trim();

    if (!apiKey) {
      throw new Error(
        "LUMA_API_KEY is missing."
      );
    }

    const response = await fetch(
      `${BASE_URL}/generations/${encodeURIComponent(
        taskId
      )}`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          Accept:
            "application/json",
        },
      }
    );

    const text =
      await response.text();

    let job;

    try {
      job = JSON.parse(text);
    } catch {
      job = {
        rawText: text,
      };
    }

    console.log(
      "🎬 LUMA STATUS:",
      job
    );

    if (!response.ok) {
      return {
        success: false,
        provider: "luma",
        taskId,

        status:
          job?.state ||
          "ERROR",

        error:
          job?.detail ||
          job?.message ||
          "Unable to check Luma generation.",

        raw: job,
      };
    }

    const output =
      Array.isArray(job?.output)
        ? job.output
        : [];

    const videoOutput =
      output.find(
        (item) =>
          item?.type === "video"
      ) ||
      output[0] ||
      null;

    const videoUrl =
      videoOutput?.url ||
      null;

    const state =
      String(
        job?.state || ""
      ).toLowerCase();

    // =================================================
    // COMPLETED
    // =================================================

    if (
      state === "completed" &&
      videoUrl
    ) {
      console.log(
        "✅ LUMA VIDEO READY:",
        videoUrl
      );

      return {
        success: true,
        provider: "luma",
        taskId,
        status: "completed",
        videoUrl,
        raw: job,
      };
    }

    // =================================================
    // FAILED
    // =================================================

    if (
      state === "failed"
    ) {
      return {
        success: false,
        provider: "luma",
        taskId,
        status: "failed",

        error:
          job?.failure_reason ||
          "Luma video generation failed.",

        failureCode:
          job?.failure_code ||
          null,

        raw: job,
      };
    }

    // =================================================
    // STILL PROCESSING
    // =================================================

    return {
      success: true,
      provider: "luma",
      taskId,

      status:
        job?.state ||
        "queued",

      videoUrl: null,

      raw: job,
    };

  } catch (error) {
    console.error(
      "❌ Luma status error:",
      error
    );

    return {
      success: false,
      provider: "luma",
      taskId,
      status: "ERROR",

      error:
        error instanceof Error
          ? error.message
          : "Luma status check failed.",
    };
  }
}

// =====================================================
// WAIT FOR LUMA VIDEO
// =====================================================

export async function waitForLumaVideo(
  taskId,
  {
    intervalMs = 5000,
    maxAttempts = 120,
  } = {}
) {
  if (!taskId) {
    return {
      success: false,
      provider: "luma",
      status: "ERROR",
      videoUrl: null,

      error:
        "Luma taskId is required.",
    };
  }

  console.log(
    "🎬 Waiting for Luma video:",
    taskId
  );

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    console.log(
      `🎬 Luma check (${attempt}/${maxAttempts})`
    );

    const status =
      await getLumaVideoStatus(
        taskId
      );

    if (status?.videoUrl) {
      return status;
    }

    if (
      String(
        status?.status || ""
      ).toLowerCase() ===
      "failed"
    ) {
      return status;
    }

    if (
      attempt < maxAttempts
    ) {
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            intervalMs
          )
      );
    }
  }

  return {
    success: false,
    provider: "luma",
    taskId,
    status: "TIMEOUT",
    videoUrl: null,

    error:
      "Luma video generation timed out.",
  };
}

// =====================================================
// DOWNLOAD GENERATED VIDEO
// =====================================================

async function downloadVideo(
  url,
  outputPath
) {
  console.log(
    "⬇️ Downloading Luma video:",
    url
  );

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to download Luma video: ${response.status}`
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

  console.log(
    "✅ Luma clip downloaded:",
    outputPath
  );

  return outputPath;
}

// =====================================================
// STITCH VIDEO CLIPS
// =====================================================

async function stitchVideos(
  videoPaths,
  outputPath
) {
  return new Promise(
    (resolve, reject) => {
      if (!videoPaths.length) {
        return reject(
          new Error(
            "No Luma video clips to stitch."
          )
        );
      }

      // -----------------------------------------------
      // Only one clip
      // -----------------------------------------------

      if (
        videoPaths.length === 1
      ) {
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

      // -----------------------------------------------
      // Multiple clips
      // -----------------------------------------------

      const command =
        ffmpeg();

      for (
        const videoPath of videoPaths
      ) {
        command.input(videoPath);
      }

      command
        .on(
          "start",
          (commandLine) => {
            console.log(
              "🎬 LUMA FFmpeg STITCHING:"
            );

            console.log(
              commandLine
            );
          }
        )

        .on(
          "progress",
          (progress) => {
            console.log(
              "🎬 Luma stitch progress:",
              progress.percent
                ? `${progress.percent.toFixed(
                    1
                  )}%`
                : "processing..."
            );
          }
        )

        .on(
          "end",
          () => {
            console.log(
              "✅ LUMA VIDEO STITCHING COMPLETE:",
              outputPath
            );

            resolve(
              outputPath
            );
          }
        )

        .on(
          "error",
          (error) => {
            console.error(
              "❌ Luma FFmpeg stitching failed:",
              error
            );

            reject(error);
          }
        )

        .mergeToFile(
          outputPath,
          path.dirname(
            outputPath
          )
        );
    }
  );
}

// =====================================================
// GENERATE ONE LUMA CLIP
// =====================================================

async function generateLumaClip({
  prompt,
  aspectRatio,
  duration,
  resolution,
  image = null,
}) {
  const apiKey =
    String(
      ENV.LUMA_API_KEY || ""
    ).trim();

  if (!apiKey) {
    throw new Error(
      "LUMA_API_KEY is missing."
    );
  }

  // -----------------------------------------------
  // Luma individual clip duration
  // -----------------------------------------------

  const numericDuration =
    Number(duration);

  const safeDuration =
    numericDuration <= 5
      ? "5s"
      : "10s";

  console.log(
    "🎬 LUMA INDIVIDUAL CLIP:",
    safeDuration
  );

  const body = {
    model:
      "ray-3.2",

    type:
      "video",

    prompt,

    aspect_ratio:
      aspectRatio,

    video: {
      resolution,

      duration:
        safeDuration,
    },
  };

  if (image) {
    body.image_ref = [
      {
        url: image,
      },
    ];
  }

  console.log(
    "🎬 LUMA AGENTS REQUEST:"
  );

  console.dir(
    body,
    {
      depth: null,
    }
  );

  const response =
    await fetch(
      `${BASE_URL}/generations`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          Accept:
            "application/json",

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(body),
      }
    );

  const text =
    await response.text();

  let job;

  try {
    job =
      JSON.parse(text);
  } catch {
    job = {
      rawText: text,
    };
  }

  console.log(
    "🎬 LUMA HTTP STATUS:",
    response.status
  );

  console.dir(
    job,
    {
      depth: null,
    }
  );

  if (!response.ok) {
    throw new Error(
      job?.detail ||
        job?.message ||
        "Luma video generation failed."
    );
  }

  const taskId =
    job?.id || null;

  if (!taskId) {
    throw new Error(
      "Luma did not return a generation ID."
    );
  }

  console.log(
    "🎬 LUMA TASK CREATED:",
    taskId
  );

  const completed =
    await waitForLumaVideo(
      taskId
    );

  if (
    !completed?.success ||
    !completed?.videoUrl
  ) {
    throw new Error(
      completed?.error ||
        "Luma clip failed to generate."
    );
  }

  return {
    success: true,

    provider:
      "luma",

    taskId,

    videoUrl:
      completed.videoUrl,

    duration:
      numericDuration <= 5
        ? 5
        : 10,

    raw:
      completed.raw,
  };
}

// =====================================================
// CREATE LUMA VIDEO
//
// Supports:
// 2–60 seconds.
//
// Luma generates individual clips.
// FFmpeg stitches multiple clips together.
// =====================================================

export async function generateLumaVideo({
  prompt,
  aspectRatio = "16:9",
  duration = "10s",
  resolution = "720p",
  image = null,
}) {
  let temporaryDirectory = null;

  try {
    // =================================================
    // VALIDATE API KEY
    // =================================================

    const apiKey =
      String(
        ENV.LUMA_API_KEY || ""
      ).trim();

    if (!apiKey) {
      throw new Error(
        "LUMA_API_KEY is missing."
      );
    }

    console.log(
      "🔑 LUMA API KEY LOADED:",
      Boolean(apiKey)
    );

    console.log(
      "🔑 LUMA KEY FORMAT:",
      apiKey.startsWith(
        "luma-api-"
      )
        ? "Agents API"
        : "Unknown"
    );

    // =================================================
    // NORMALIZE REQUESTED DURATION
    // =================================================

    let requestedDuration =
      Number(
        String(duration)
          .replace(/s/gi, "")
          .trim()
      );

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

    // Zuri supports 2–60 seconds.
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
      "🎬 ZURI LUMA VIDEO REQUEST:",
      {
        requestedDuration,
        prompt,
        aspectRatio,
        resolution,
        hasImage: !!image,
      }
    );

    // =================================================
    // CALCULATE CLIPS
    // =================================================

    const clipDurations = [];

    let remaining =
      requestedDuration;

    while (
      remaining > 0
    ) {
      let clipDuration =
        Math.min(
          10,
          remaining
        );

      // -----------------------------------------------
      // Luma supports 5s or 10s individual clips.
      //
      // If the final remainder is below 5 seconds,
      // make the previous clip absorb the remainder.
      // -----------------------------------------------

      if (
        clipDuration < 5
      ) {
        if (
          clipDurations.length
        ) {
          clipDurations[
            clipDurations.length - 1
          ] += clipDuration;

          remaining = 0;

          break;
        }

        clipDuration = 5;
      }

      clipDurations.push(
        clipDuration
      );

      remaining -=
        clipDuration;
    }

    console.log(
      "🎬 LUMA CLIPS REQUIRED:",
      clipDurations
    );

    // =================================================
    // SINGLE CLIP
    // =================================================

    if (
      clipDurations.length === 1
    ) {
      const clip =
        await generateLumaClip({
          prompt,
          aspectRatio,
          duration:
            clipDurations[0],
          resolution,
          image,
        });

      return {
        success: true,

        provider:
          "luma",

        taskId:
          clip.taskId,

        taskIds: [
          clip.taskId,
        ],

        status:
          "SUCCEEDED",

        duration:
          requestedDuration,

        clipCount:
          1,

        videoUrl:
          clip.videoUrl,

        videoPath:
          null,

        message:
          `Zuri generated a ${requestedDuration}-second Luma video.`,
      };
    }

    // =================================================
    // MULTI-CLIP GENERATION
    // =================================================

    temporaryDirectory =
      await fs.promises.mkdtemp(
        path.join(
          os.tmpdir(),
          "zuri-luma-"
        )
      );

    console.log(
      "📁 LUMA TEMP DIRECTORY:",
      temporaryDirectory
    );

    const videoPaths = [];
    const taskIds = [];

    // =================================================
    // GENERATE EACH CLIP
    // =================================================

    for (
      let index = 0;
      index <
      clipDurations.length;
      index++
    ) {
      const clipDuration =
        clipDurations[index];

      console.log(
        `🎬 GENERATING LUMA CLIP ${
          index + 1
        }/${clipDurations.length}`,
        {
          duration:
            clipDuration,
        }
      );

      // -----------------------------------------------
      // Give every clip context about its position.
      // -----------------------------------------------

      const clipPrompt = `
${prompt}

This is scene ${
        index + 1
      } of ${
        clipDurations.length
      } in one continuous cinematic video.

Maintain the same characters, world,
visual identity, lighting, camera language,
color palette and overall cinematic style.

Scene ${
        index + 1
      } should feel like a natural continuation
of the previous scene.

Do not add unnecessary text overlays.

Keep the visual storytelling coherent
and suitable for a premium technology commercial.
`;

      const clip =
        await generateLumaClip({
          prompt:
            clipPrompt,

          aspectRatio,

          duration:
            clipDuration,

          resolution,

          // Only use supplied source image
          // for the first clip.
          image:
            index === 0
              ? image
              : null,
        });

      taskIds.push(
        clip.taskId
      );

      const clipPath =
        path.join(
          temporaryDirectory,
          `clip-${index + 1}.mp4`
        );

      await downloadVideo(
        clip.videoUrl,
        clipPath
      );

      videoPaths.push(
        clipPath
      );

      console.log(
        `✅ LUMA CLIP ${
          index + 1
        } COMPLETE`
      );
    }

    // =================================================
    // STITCH
    // =================================================

    const finalVideoPath =
      path.join(
        temporaryDirectory,
        "zuri-final.mp4"
      );

    console.log(
      "🎬 STITCHING LUMA VIDEO:",
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

    // =================================================
    // FINAL RESULT
    // =================================================

    console.log(
      "✅ ZURI LONG LUMA VIDEO COMPLETE:",
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
        "luma",

      taskId:
        taskIds.join(","),

      taskIds,

      status:
        "SUCCEEDED",

      duration:
        requestedDuration,

      clipCount:
        videoPaths.length,

      // Your chat route can move this
      // into /generated.
      videoPath:
        finalVideoPath,

      videoUrl:
        null,

      message:
        `Zuri generated a ${requestedDuration}-second video using ${videoPaths.length} Luma clips.`,
    };

  } catch (error) {
    console.error(
      "❌ Luma generation error:",
      error
    );

    return {
      success: false,

      provider:
        "luma",

      status:
        "ERROR",

      error:
        error instanceof Error
          ? error.message
          : "Luma video generation failed.",
    };
  }
}