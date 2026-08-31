import { execFile } from "child_process";
import crypto from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";

import ffmpegPath from "ffmpeg-static";

import { generateMusic } from "./musicGeneration.js";
import { generateVideo } from "./videoGeneration.js";

const execFileAsync = promisify(execFile);

/**
 * =====================================================
 * PATHS
 * =====================================================
 */

const generatedDir = path.resolve(
  process.cwd(),
  "generated"
);

/**
 * =====================================================
 * FFMPEG
 * =====================================================
 */

const FFMPEG_PATH =
  ffmpegPath ||
  process.env.FFMPEG_PATH;

if (!FFMPEG_PATH) {
  throw new Error(
    "FFmpeg could not be located. Install ffmpeg-static or set FFMPEG_PATH."
  );
}

console.log(
  "🎬 FFMPEG PATH:",
  FFMPEG_PATH
);

/**
 * =====================================================
 * PUBLIC BACKEND URL
 * =====================================================
 */

const PUBLIC_BASE_URL =
  process.env.BACKEND_PUBLIC_URL ||
  `http://localhost:${
    process.env.PORT || 3001
  }`;

/**
 * =====================================================
 * EXTRACT VIDEO DURATION
 * =====================================================
 */

function extractVideoDuration(prompt) {
  const text = String(prompt || "").trim();

  const match = text.match(
    /\b(\d+(?:\.\d+)?)\s*(seconds?|secs?|sec|s)\b/i
  );

  if (!match) {
    return 10;
  }

  const requested = Number(match[1]);

  if (!Number.isFinite(requested)) {
    return 10;
  }

  return Math.max(
    5,
    Math.min(requested, 60)
  );
}

/**
 * =====================================================
 * EXTRACT AUDIO URL
 * =====================================================
 */

function extractAudioUrl(musicResult) {
  if (!musicResult) {
    return null;
  }

  const directCandidates = [
    musicResult.sourceAudioUrl,
    musicResult.source_audio_url,

    musicResult.audioUrl,
    musicResult.audio_url,

    musicResult.sourceStreamAudioUrl,
    musicResult.source_stream_audio_url,

    musicResult.streamAudioUrl,
    musicResult.stream_audio_url,
  ];

  for (const candidate of directCandidates) {
    if (
      typeof candidate === "string" &&
      candidate.startsWith("http")
    ) {
      return candidate;
    }
  }

  const raw = musicResult.raw;

  const nestedCandidates = [
    raw?.sourceAudioUrl,
    raw?.source_audio_url,

    raw?.audioUrl,
    raw?.audio_url,

    raw?.sourceStreamAudioUrl,
    raw?.source_stream_audio_url,

    raw?.streamAudioUrl,
    raw?.stream_audio_url,

    raw?.data?.sourceAudioUrl,
    raw?.data?.source_audio_url,

    raw?.data?.audioUrl,
    raw?.data?.audio_url,

    raw?.data?.response?.sourceAudioUrl,
    raw?.data?.response?.source_audio_url,

    raw?.data?.response?.audioUrl,
    raw?.data?.response?.audio_url,

    raw?.data?.response?.sunoData?.[0]
      ?.sourceAudioUrl,

    raw?.data?.response?.sunoData?.[0]
      ?.audioUrl,

    raw?.data?.response?.data?.[0]
      ?.sourceAudioUrl,

    raw?.data?.response?.data?.[0]
      ?.audioUrl,

    raw?.data?.data?.[0]
      ?.sourceAudioUrl,

    raw?.data?.data?.[0]
      ?.audioUrl,
  ];

  for (const candidate of nestedCandidates) {
    if (
      typeof candidate === "string" &&
      candidate.startsWith("http")
    ) {
      return candidate;
    }
  }

  return null;
}

/**
 * =====================================================
 * DOWNLOAD REMOTE MEDIA
 * =====================================================
 */

async function downloadFile(
  url,
  outputPath,
  {
    retries = 5,
    timeoutMs = 180000,
  } = {}
) {
  if (!url) {
    throw new Error(
      "Media URL is missing."
    );
  }

  let lastError = null;

  for (
    let attempt = 1;
    attempt <= retries;
    attempt++
  ) {
    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () => controller.abort(),
        timeoutMs
      );

    try {
      console.log(
        `⬇️ Download attempt ${attempt}/${retries}:`,
        url
      );

      const response = await fetch(
        url,
        {
          method: "GET",

          signal: controller.signal,

          headers: {
            Accept: "*/*",
            "User-Agent": "Zuri/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const buffer =
        Buffer.from(
          await response.arrayBuffer()
        );

      if (!buffer.length) {
        throw new Error(
          "Downloaded file is empty."
        );
      }

      await fs.writeFile(
        outputPath,
        buffer
      );

      console.log(
        "✅ Downloaded:",
        outputPath
      );

      return;

    } catch (error) {
      lastError = error;

      console.error(
        `⚠️ Download attempt ${attempt} failed:`,
        error
      );

      if (attempt < retries) {
        const delay = Math.min(
          2000 * attempt,
          10000
        );

        console.log(
          `⏳ Retrying in ${delay}ms...`
        );

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              delay
            )
        );
      }

    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(
    `Failed to download media after ${retries} attempts: ${
      lastError instanceof Error
        ? lastError.message
        : "Unknown download error"
    }`
  );
}

/**
 * =====================================================
 * MERGE VIDEO + SUNO MUSIC
 * =====================================================
 */

async function mergeVideoAndMusic({
  videoUrl,
  musicUrl,
}) {
  if (!videoUrl) {
    throw new Error(
      "Video URL is missing."
    );
  }

  if (!musicUrl) {
    throw new Error(
      "Music URL is missing."
    );
  }

  await fs.mkdir(
    generatedDir,
    {
      recursive: true,
    }
  );

  const tempDir =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "zuri-video-"
      )
    );

  const videoPath =
    path.join(
      tempDir,
      "video.mp4"
    );

  const musicPath =
    path.join(
      tempDir,
      "music.mp3"
    );

  const outputName =
    `zuri-${crypto.randomUUID()}.mp4`;

  const outputPath =
    path.join(
      generatedDir,
      outputName
    );

  try {
    /**
     * ==========================================
     * DOWNLOAD VIDEO
     * ==========================================
     */

    console.log(
      "⬇️ Downloading generated video..."
    );

    await downloadFile(
      videoUrl,
      videoPath,
      {
        retries: 5,
        timeoutMs: 180000,
      }
    );

    /**
     * ==========================================
     * DOWNLOAD SUNO MUSIC
     * ==========================================
     */

    console.log(
      "⬇️ Downloading Suno soundtrack..."
    );

    await downloadFile(
      musicUrl,
      musicPath,
      {
        retries: 5,
        timeoutMs: 180000,
      }
    );

    /**
     * ==========================================
     * FFMPEG
     * ==========================================
     *
     * Video:
     *   Generated by Runway/Luma
     *
     * Audio:
     *   Generated by Suno
     *
     * The Suno track is looped if necessary.
     * The final video duration follows the video.
     */

    console.log(
      "🎬🎵 Combining video + Suno soundtrack..."
    );

    const ffmpegArgs = [
      "-y",

      "-i",
      videoPath,

      "-stream_loop",
      "-1",

      "-i",
      musicPath,

      "-filter_complex",
      "[1:a]volume=0.35[music]",

      "-map",
      "0:v:0",

      "-map",
      "[music]",

      "-c:v",
      "libx264",

      "-preset",
      "medium",

      "-crf",
      "20",

      "-pix_fmt",
      "yuv420p",

      "-c:a",
      "aac",

      "-b:a",
      "192k",

      "-shortest",

      "-movflags",
      "+faststart",

      outputPath,
    ];

    console.log(
      "🎬 FFMPEG VIDEO + MUSIC:"
    );

    console.dir(
      ffmpegArgs,
      {
        depth: null,
      }
    );

    const result =
      await execFileAsync(
        FFMPEG_PATH,
        ffmpegArgs,
        {
          maxBuffer:
            20 * 1024 * 1024,
        }
      );

    if (result.stderr) {
      console.log(
        "🎬 FFMPEG:",
        result.stderr
      );
    }

    /**
     * ==========================================
     * VERIFY FINAL FILE
     * ==========================================
     */

    const stat =
      await fs.stat(
        outputPath
      );

    if (
      !stat.isFile() ||
      stat.size === 0
    ) {
      throw new Error(
        "FFmpeg produced an empty video."
      );
    }

    const finalVideoUrl =
      `${PUBLIC_BASE_URL}/generated/${outputName}`;

    console.log(
      "✅ FINAL VIDEO WITH SUNO SOUND READY"
    );

    console.log(
      "🌍 FINAL VIDEO URL:",
      finalVideoUrl
    );

    return {
      outputPath,
      outputName,
      finalVideoUrl,
    };

  } finally {
    await fs.rm(
      tempDir,
      {
        recursive: true,
        force: true,
      }
    );
  }
}

/**
 * =====================================================
 * MAIN VIDEO GENERATOR
 * =====================================================
 *
 * Pipeline:
 *
 * USER REQUEST
 *      ↓
 * VIDEO PROVIDER
 *      ↓
 * GENERATED VIDEO
 *      ↓
 * SUNO INSTRUMENTAL
 *      ↓
 * FFMPEG
 *      ↓
 * FINAL MP4
 *
 * No speech.
 * No voice generation.
 * No lip synchronization.
 * No Kling.
 */

export async function generateVideoWithAudio({
  prompt,
  image = null,
  style = "",
  quality = "standard",
}) {
  try {
    console.log(
      "================================================="
    );

    console.log(
      "🎬 ZURI VIDEO GENERATION STARTED"
    );

    console.log(
      "================================================="
    );

    /**
     * ================================================
     * DURATION
     * ================================================
     */

    const duration =
      extractVideoDuration(
        prompt
      );

    console.log(
      "🎬 Requested duration:",
      duration,
      "seconds"
    );

    /**
     * ================================================
     * GENERATE VISUAL VIDEO
     * ================================================
     */

    console.log(
      "🎬 Generating visual video..."
    );

    const videoResult =
      await generateVideo({
        prompt,
        image,
        style,
        quality,
        duration,
      });

    console.log(
      "🎬 VIDEO RESULT:"
    );

    console.dir(
      videoResult,
      {
        depth: null,
      }
    );

    const originalVideoUrl =
      videoResult?.videoUrl ||
      videoResult?.url ||
      videoResult?.data?.videoUrl ||
      videoResult?.data?.url ||
      null;

    if (!originalVideoUrl) {
      throw new Error(
        videoResult?.error ||
        "Video provider did not return a video URL."
      );
    }

    console.log(
      "🎬 ORIGINAL VIDEO URL:",
      originalVideoUrl
    );

    /**
     * ================================================
     * GENERATE SUNO SOUNDTRACK
     * ================================================
     */

    console.log(
      "🎵 Generating Suno instrumental soundtrack..."
    );

    const musicResult =
      await generateMusic({
        prompt,

        style:
          style ||
          "Cinematic contemporary African instrumental, energetic, uplifting, futuristic, premium production",

        instrumental:
          true,

        title:
          "Zuri Video Soundtrack",

        waitForCompletion:
          true,
      });

    console.log(
      "🎵 SUNO RESULT:"
    );

    console.dir(
      musicResult,
      {
        depth: null,
      }
    );

    if (!musicResult?.success) {
      throw new Error(
        musicResult?.error ||
        "Suno music generation failed."
      );
    }

    const musicUrl =
      extractAudioUrl(
        musicResult
      );

    if (!musicUrl) {
      throw new Error(
        "Suno completed but no usable audio URL was returned."
      );
    }

    console.log(
      "✅ SUNO AUDIO URL:",
      musicUrl
    );

    /**
     * ================================================
     * MERGE VIDEO + MUSIC
     * ================================================
     */

    console.log(
      "🎬🎵 Creating final video with Suno sound..."
    );

    const merged =
      await mergeVideoAndMusic({
        videoUrl:
          originalVideoUrl,

        musicUrl,
      });

    /**
     * ================================================
     * FINAL RESULT
     * ================================================
     */

    return {
      success: true,

      provider:
        "video-with-suno-music",

      videoUrl:
        merged.finalVideoUrl,

      finalVideoUrl:
        merged.finalVideoUrl,

      originalVideoUrl,

      audioEnabled:
        true,

      audioType:
        "music",

      musicTaskId:
        musicResult?.musicTaskId ||
        musicResult?.taskId ||
        musicResult?.data?.taskId ||
        null,

      duration,

      message:
        "Zuri generated your video with a Suno soundtrack.",
    };

  } catch (error) {
    console.error(
      "❌ VIDEO + SUNO GENERATION ERROR:",
      error
    );

    return {
      success: false,

      provider:
        "video-with-suno-music",

      videoUrl:
        null,

      finalVideoUrl:
        null,

      error:
        error instanceof Error
          ? error.message
          : "Video generation failed.",
    };
  }
}