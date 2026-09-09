import { ENV } from "../../config/environment.js";

import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";

import fs from "fs";
import os from "os";
import path from "path";

const BASE_URL =
  "https://agents.lumalabs.ai/v1";

console.log(
  "🔥 LUMA VIDEO PROVIDER LOADED"
);

// =====================================================
// FFMPEG
// =====================================================

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

// =====================================================
// GET LUMA API KEY
// =====================================================

function getApiKey() {
  const apiKey =
    String(
      ENV.LUMA_API_KEY || ""
    ).trim();

  if (!apiKey) {
    throw new Error(
      "LUMA_API_KEY is missing."
    );
  }

  return apiKey;
}

// =====================================================
// LUMA STATUS
// =====================================================

export async function getLumaVideoStatus(
  taskId
) {
  try {
    const apiKey =
      getApiKey();

    const response =
      await fetch(
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
      job =
        JSON.parse(text);
    } catch {
      job = {
        rawText: text,
      };
    }

    console.log(
      "🎬 LUMA STATUS:",
      JSON.stringify(
        job,
        null,
        2
      )
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
          job?.failure_reason ||
          job?.detail ||
          job?.message ||
          "Unable to check Luma generation.",

        failureCode:
          job?.failure_code ||
          null,

        raw: job,
      };
    }

    const state =
      String(
        job?.state || ""
      ).toLowerCase();

    // =================================================
    // COMPLETED
    // =================================================

    if (
      state === "completed"
    ) {
      const output =
        Array.isArray(
          job?.output
        )
          ? job.output
          : [];

      const videoOutput =
        output.find(
          (item) =>
            item?.type ===
            "video"
        ) ||
        output[0] ||
        null;

      const videoUrl =
        videoOutput?.url ||
        null;

      if (!videoUrl) {
        return {
          success: false,
          provider: "luma",
          taskId,
          status: "completed",

          error:
            "Luma completed the generation but did not return a video URL.",

          raw: job,
        };
      }

      console.log(
        "✅ LUMA VIDEO READY:",
        videoUrl
      );

      return {
        success: true,

        provider: "luma",

        taskId,

        status:
          "completed",

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
      console.error(
        "❌ LUMA GENERATION FAILED:",
        job
      );

      return {
        success: false,

        provider:
          "luma",

        taskId,

        status:
          "failed",

        error:
          job?.failure_reason ||
          job?.detail ||
          job?.message ||
          "Luma video generation failed.",

        failureCode:
          job?.failure_code ||
          null,

        raw:
          job,
      };
    }

    // =================================================
    // STILL PROCESSING
    // =================================================

    return {
      success: true,

      provider:
        "luma",

      taskId,

      status:
        job?.state ||
        "queued",

      videoUrl:
        null,

      raw:
        job,
    };

  } catch (error) {
    console.error(
      "❌ Luma status error:",
      error
    );

    return {
      success: false,

      provider:
        "luma",

      taskId,

      status:
        "ERROR",

      error:
        error instanceof Error
          ? error.message
          : "Luma status check failed.",
    };
  }
}

// =====================================================
// WAIT FOR LUMA
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

      provider:
        "luma",

      status:
        "ERROR",

      videoUrl:
        null,

      error:
        "Luma taskId is required.",
    };
  }

  console.log(
    "🎬 WAITING FOR LUMA:",
    taskId
  );

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    console.log(
      `🎬 LUMA CHECK ${attempt}/${maxAttempts}`
    );

    const status =
      await getLumaVideoStatus(
        taskId
      );

    if (
      status?.videoUrl
    ) {
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
      attempt <
      maxAttempts
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

    provider:
      "luma",

    taskId,

    status:
      "TIMEOUT",

    videoUrl:
      null,

    error:
      "Luma video generation timed out.",
  };
}

// =====================================================
// DOWNLOAD LUMA VIDEO
// =====================================================

async function downloadVideo(
  url,
  outputPath
) {
  if (!url) {
    throw new Error(
      "Luma video URL is missing."
    );
  }

  console.log(
    "⬇️ Downloading Luma video..."
  );

  const response =
    await fetch(
      url,
      {
        headers: {
          Accept:
            "video/mp4,*/*",
          "User-Agent":
            "Zuri/1.0",
        },
      }
    );

  if (!response.ok) {
    throw new Error(
      `Failed to download Luma video: HTTP ${response.status}`
    );
  }

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    );

  if (!buffer.length) {
    throw new Error(
      "Luma returned an empty video."
    );
  }

  await fs.promises.writeFile(
    outputPath,
    buffer
  );

  console.log(
    "✅ LUMA VIDEO DOWNLOADED:",
    outputPath
  );

  return outputPath;
}

// =====================================================
// STITCH MULTIPLE LUMA CLIPS
// =====================================================

async function stitchVideos(
  videoPaths,
  outputPath
) {
  if (
    !videoPaths.length
  ) {
    throw new Error(
      "No Luma clips available for stitching."
    );
  }

  if (
    videoPaths.length === 1
  ) {
    await fs.promises.copyFile(
      videoPaths[0],
      outputPath
    );

    return outputPath;
  }

  return new Promise(
    (resolve, reject) => {
      const command =
        ffmpeg();

      for (
        const videoPath of videoPaths
      ) {
        command.input(
          videoPath
        );
      }

      command
        .on(
          "start",
          (commandLine) => {
            console.log(
              "🎬 LUMA FFMPEG:",
              commandLine
            );
          }
        )

        .on(
          "progress",
          (progress) => {
            console.log(
              "🎬 LUMA STITCH:",
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
              "✅ LUMA CLIPS STITCHED:"
            );

            console.log(
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
              "❌ LUMA STITCH ERROR:",
              error
            );

            reject(
              error
            );
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
    getApiKey();

  // Luma Ray 3.2 currently accepts
  // 5s or 10s video durations.
  const safeDuration =
    Number(duration) <= 5
      ? "5s"
      : "10s";

  console.log(
    "🎬 LUMA CLIP REQUEST:",
    {
      duration:
        safeDuration,

      aspectRatio,

      resolution,

      hasImage:
        !!image,
    }
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

  // ===================================================
  // IMAGE → VIDEO
  //
  // Current Luma Agents API uses video.start_frame.
  // ===================================================

  if (image) {
    body.video.start_frame = {
      url: image,
    };
  }

  console.log(
    "🎬 LUMA REQUEST BODY:"
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
        method:
          "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          Accept:
            "application/json",

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            body
          ),
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
      rawText:
        text,
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
      job?.failure_reason ||
      job?.detail ||
      job?.message ||
      "Luma video generation failed."
    );
  }

  const taskId =
    job?.id ||
    job?.generation_id ||
    null;

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
      "Luma video generation failed."
    );
  }

  return {
    success:
      true,

    provider:
      "luma",

    taskId,

    videoUrl:
      completed.videoUrl,

    duration:
      Number(duration) <= 5
        ? 5
        : 10,

    raw:
      completed.raw,
  };
}

// =====================================================
// CALCULATE VALID LUMA CLIPS
// =====================================================
//
// Luma accepts only 5s or 10s per generation.
//
// Examples:
//
// 5  → [5]
// 10 → [10]
// 15 → [10,5]
// 20 → [10,10]
// 25 → [10,10,5]
// 30 → [10,10,10]
//
// =====================================================

function calculateClipDurations(
  requestedDuration
) {
  const clips = [];

  let remaining =
    requestedDuration;

  while (
    remaining > 0
  ) {
    if (
      remaining >= 10
    ) {
      clips.push(10);

      remaining -= 10;

      continue;
    }

    if (
      remaining >= 5
    ) {
      clips.push(5);

      remaining -= 5;

      continue;
    }

    // Remaining 1–4 seconds.
    //
    // We cannot create a 1–4 second Luma
    // clip, so extend the final clip by
    // up to 5 seconds.
    //
    // Example:
    // 12 seconds → 10 + 5
    // 17 seconds → 10 + 5 + 5
    // Actual result may be slightly longer
    // than requested.

    if (
      clips.length
    ) {
      clips[
        clips.length - 1
      ] += 5;

      remaining = 0;

      break;
    }

    clips.push(5);

    remaining = 0;
  }

  return clips;
}

// =====================================================
// GENERATE LUMA VIDEO
// =====================================================

export async function generateLumaVideo({
  prompt,

  aspectRatio =
    "16:9",

  duration =
    "10s",

  resolution =
    "720p",

  image =
    null,
}) {
  let temporaryDirectory =
    null;

  try {
    getApiKey();

    // =================================================
    // NORMALIZE DURATION
    // =================================================

    let requestedDuration =
      Number(
        String(
          duration
        )
          .replace(
            /s/gi,
            ""
          )
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

    requestedDuration =
      Math.max(
        2,
        Math.min(
          requestedDuration,
          60
        )
      );

    console.log(
      "🎬 ZURI LUMA VIDEO REQUEST:",
      {
        requestedDuration,

        prompt,

        aspectRatio,

        resolution,

        hasImage:
          !!image,
      }
    );

    // =================================================
    // CALCULATE CLIPS
    // =================================================

    const clipDurations =
      calculateClipDurations(
        requestedDuration
      );

    console.log(
      "🎬 LUMA CLIPS REQUIRED:",
      clipDurations
    );

    // =================================================
    // SINGLE CLIP
    // =================================================

    if (
      clipDurations.length ===
      1
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
        success:
          true,

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
          clipDurations[0],

        clipCount:
          1,

        videoUrl:
          clip.videoUrl,

        videoPath:
          null,

        message:
          `Zuri generated a ${clipDurations[0]}-second Luma video.`,
      };
    }

    // =================================================
    // MULTI-CLIP
    // =================================================

    temporaryDirectory =
      await fs.promises.mkdtemp(
        path.join(
          os.tmpdir(),
          "zuri-luma-"
        )
      );

    const videoPaths =
      [];

    const taskIds =
      [];

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
        }/${clipDurations.length}`
      );

      const clipPrompt = `
${prompt}

This is scene ${
        index + 1
      } of ${
        clipDurations.length
      }.

Maintain continuity with the overall concept.

Keep the same:
- characters
- environment
- visual identity
- lighting
- camera language
- color palette
- cinematic style

Make this scene feel like a natural continuation
of the previous scene.

Do not add text overlays unless explicitly requested.
`;

      const clip =
        await generateLumaClip({
          prompt:
            clipPrompt,

          aspectRatio,

          duration:
            clipDuration,

          resolution,

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

    await stitchVideos(
      videoPaths,
      finalVideoPath
    );

    console.log(
      "✅ ZURI LUMA VIDEO COMPLETE:",
      finalVideoPath
    );

    return {
      success:
        true,

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

      videoPath:
        finalVideoPath,

      videoUrl:
        null,

      message:
        `Zuri generated a ${requestedDuration}-second video using ${videoPaths.length} Luma clips.`,
    };

  } catch (error) {
    console.error(
      "❌ LUMA VIDEO GENERATION ERROR:",
      error
    );

    return {
      success:
        false,

      provider:
        "luma",

      status:
        "ERROR",

      videoUrl:
        null,

      videoPath:
        null,

      error:
        error instanceof Error
          ? error.message
          : "Luma video generation failed.",
    };

  } finally {
    // =================================================
    // IMPORTANT:
    //
    // Do NOT delete the temporary directory here
    // when returning videoPath for a multi-clip video.
    //
    // The caller needs the generated file first.
    //
    // For now we intentionally leave cleanup to the
    // final video pipeline.
    // =================================================
  }
}