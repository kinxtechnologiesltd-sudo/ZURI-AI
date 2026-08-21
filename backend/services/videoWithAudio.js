import { execFile } from "child_process";
import crypto from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";

import ffmpegPath from "ffmpeg-static";

import {
  lipSyncVideo,
} from "./lipSync.js";
import { generateMusic } from "./musicGeneration.js";
import { generateVideo } from "./videoGeneration.js";
import {
  generateSpeechForVideo,
} from "./voiceGeneration.js";

const execFileAsync =
  promisify(execFile);

/**
 * =====================================================
 * PATHS
 * =====================================================
 */

const generatedDir =
  path.resolve(
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

function extractVideoDuration(
  prompt
) {
  const text =
    String(
      prompt || ""
    ).trim();

  const match =
    text.match(
      /\b(\d+(?:\.\d+)?)\s*(seconds?|secs?|sec|s)\b/i
    );

  if (!match) {
    return 10;
  }

  const requested =
    Number(match[1]);

  if (
    !Number.isFinite(
      requested
    )
  ) {
    return 10;
  }

  return Math.max(
    5,
    Math.min(
      requested,
      60
    )
  );
}

/**
 * =====================================================
 * TALKING VIDEO DETECTION
 * =====================================================
 */

function isTalkingVideoRequest(prompt = "") {
  const text = String(prompt || "").toLowerCase();

  const talkingKeywords = [
    "talking",
    "talk",
    "speaking",
    "speak",
    "says",
    "say",
    "saying",
    "shout",
    "shouts",
    "shouting",
    "yell",
    "yelled",
    "yelling",
    "narrator",
    "narration",
    "interview",
    "presenter",
    "presentation",
    "explains",
    "explain",
    "tells",
    "telling",
    "voiceover",
    "voice-over",
    "voice over",
    "dialogue",
    "conversation",
    "speaks",
    "speaker",
    "person talking",
    "woman talking",
    "man talking",
    "character talking",
    "someone talking",
  ];

  return talkingKeywords.some((keyword) =>
    text.includes(keyword)
  );
}

/**
 * =====================================================
 * DETECT AUDIO MODE
 * =====================================================
 *
 * Possible:
 *
 * none
 * music
 * speech
 * both
 *
 * Talking videos automatically receive:
 *
 * SPEECH + BACKGROUND MUSIC
 */

function detectAudioMode(prompt = "") {
  const text = String(prompt || "")
    .trim()
    .toLowerCase();

  /**
   * Explicit silence
   */

  const silenceKeywords = [
    "silent",
    "silence",
    "mute",
    "muted",
    "no sound",
    "no audio",
    "without sound",
    "without audio",
    "remove audio",
    "remove the sound",
  ];

  if (
    silenceKeywords.some((keyword) =>
      text.includes(keyword)
    )
  ) {
    return "none";
  }

  const talking =
    isTalkingVideoRequest(text);

  /**
   * Explicit speech only
   */

  const speechOnlyKeywords = [
    "speech only",
    "voice only",
    "dialogue only",
    "no music",
    "without music",
    "speech without music",
    "voice without music",
  ];

  const speechOnly =
    speechOnlyKeywords.some((keyword) =>
      text.includes(keyword)
    );

  if (talking && speechOnly) {
    return "speech";
  }

  /**
   * Talking video:
   *
   * Speech + music
   */

  if (talking) {
    return "both";
  }

  /**
   * Explicit music
   */

  const musicKeywords = [
    "song",
    "music",
    "afrobeat",
    "afrobeats",
    "afropop",
    "rap",
    "beat",
    "instrumental",
    "soundtrack",
    "background music",
  ];

  if (
    musicKeywords.some((keyword) =>
      text.includes(keyword)
    )
  ) {
    return "music";
  }

  /**
   * Default
   */

  return "music";
}

/**
 * =====================================================
 * EXTRACT AUDIO URL
 * =====================================================
 */

function extractAudioUrl(
  musicResult
) {
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

  for (
    const candidate of directCandidates
  ) {
    if (
      typeof candidate === "string" &&
      candidate.startsWith("http")
    ) {
      return candidate;
    }
  }

  const raw =
    musicResult.raw;

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

  for (
    const candidate of nestedCandidates
  ) {
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
        () =>
          controller.abort(),
        timeoutMs
      );

    try {
      console.log(
        `⬇️ Download attempt ${attempt}/${retries}:`,
        url
      );

      const response =
        await fetch(
          url,
          {
            method: "GET",

            signal:
              controller.signal,

            headers: {
              Accept: "*/*",

              "User-Agent":
                "Zuri/1.0",
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
      lastError =
        error;

      console.error(
        `⚠️ Download attempt ${attempt} failed:`,
        error
      );

      if (
        attempt < retries
      ) {
        const delay =
          Math.min(
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
      clearTimeout(
        timeout
      );
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
 * MIX MUSIC INTO LIP-SYNCED VIDEO
 * =====================================================
 *
 * IMPORTANT:
 *
 * The lip-sync provider already returns a video
 * containing the generated speech.
 *
 * Therefore:
 *
 * VIDEO AUDIO = SPEECH
 *
 * We DO NOT add speechBuffer again.
 *
 * We only mix:
 *
 *     existing speech
 *             +
 *     background music
 *
 * Speech volume:
 *     1.0
 *
 * Music volume:
 *     0.18
 */

async function mergeSpeechAndMusic({
  videoUrl,
  musicUrl,
}) {
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
      "lip-synced-video.mp4"
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
     * DOWNLOAD LIP-SYNCED VIDEO
     * ==========================================
     */

    console.log(
      "⬇️ Downloading lip-synced video..."
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
     * DOWNLOAD MUSIC
     * ==========================================
     */

    console.log(
      "⬇️ Downloading background music..."
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
     * Input 0:
     *     Lip-synced video
     *
     * Input 0 audio:
     *     Already contains speech
     *
     * Input 1:
     *     Background music
     *
     * We mix them.
     */

    console.log(
      "🎬🎙️🎵 Mixing speech + background music..."
    );

    const ffmpegArgs = [
      "-y",

      /**
       * Lip-synced video
       */

      "-i",
      videoPath,

      /**
       * Loop music
       * so it can cover the whole video.
       */

      "-stream_loop",
      "-1",

      "-i",
      musicPath,

      /**
       * ========================================
       * AUDIO MIX
       * ========================================
       */

      "-filter_complex",

      "[0:a]volume=1.0[speech];" +
      "[1:a]volume=0.18[music];" +
      "[speech][music]" +
      "amix=inputs=2:" +
      "duration=first:" +
      "dropout_transition=2" +
      "[mixed]",

      /**
       * ========================================
       * VIDEO
       * ========================================
       */

      "-map",
      "0:v:0",

      /**
       * ========================================
       * FINAL AUDIO
       * ========================================
       */

      "-map",
      "[mixed]",

      /**
       * ========================================
       * VIDEO ENCODING
       * ========================================
       */

      "-c:v",
      "libx264",

      "-preset",
      "medium",

      "-crf",
      "20",

      "-pix_fmt",
      "yuv420p",

      /**
       * ========================================
       * AUDIO ENCODING
       * ========================================
       */

      "-c:a",
      "aac",

      "-b:a",
      "192k",

      /**
       * Keep final duration equal
       * to the video.
       */

      "-shortest",

      /**
       * Browser-friendly MP4.
       */

      "-movflags",
      "+faststart",

      outputPath,
    ];

    console.log(
      "🎬 FFMPEG AUDIO MIX:"
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

    if (
      result.stderr
    ) {
      console.log(
        "🎬 FFMPEG:",
        result.stderr
      );
    }

    /**
     * ==========================================
     * VERIFY OUTPUT
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
      "✅ FINAL VIDEO WITH SPEECH + MUSIC READY"
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
 * MUSIC ONLY
 * =====================================================
 */

async function mergeMusicOnly({
  videoUrl,
  musicUrl,
}) {
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
        "zuri-music-"
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
    await downloadFile(
      videoUrl,
      videoPath
    );

    await downloadFile(
      musicUrl,
      musicPath
    );

    console.log(
      "🎵 Adding background music..."
    );

    const args = [
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

    await execFileAsync(
      FFMPEG_PATH,
      args,
      {
        maxBuffer:
          20 * 1024 * 1024,
      }
    );

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
 * SPEECH ONLY
 * =====================================================
 *
 * The lip-sync provider already returns a video
 * containing the speech.
 *
 * Therefore there is NO reason to run FFmpeg
 * again just to add the same speech buffer.
 */

async function returnSpeechVideo({
  videoUrl,
}) {
  if (!videoUrl) {
    throw new Error(
      "Speech video URL is missing."
    );
  }

  console.log(
    "🗣️ Speech-only video ready."
  );

  return {
    finalVideoUrl:
      videoUrl,

    outputPath:
      null,

    outputName:
      null,
  };
}

/**
 * =====================================================
 * MAIN VIDEO + AUDIO GENERATOR
 * =====================================================
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
      "🎬 ZURI VIDEO + AUDIO GENERATION STARTED"
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
     * AUDIO MODE
     * ================================================
     */

    const audioMode =
      detectAudioMode(
        prompt
      );

    console.log(
      "🎵 AUDIO MODE:",
      audioMode
    );

    /**
     * ================================================
     * GENERATE VIDEO
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
     * SILENT VIDEO
     * ================================================
     */

    if (
      audioMode === "none"
    ) {
      console.log(
        "🔇 SILENT VIDEO REQUESTED"
      );

      return {
        success: true,

        provider:
          "video",

        videoUrl:
          originalVideoUrl,

        finalVideoUrl:
          originalVideoUrl,

        originalVideoUrl,

        audioEnabled:
          false,

        audioType:
          "none",

        duration,
      };
    }

    /**
     * ================================================
     * SPEECH
     * ================================================
     *
     * Talking videos get:
     *
     * 1. AI-generated speech
     * 2. Lip synchronization
     *
     * The returned lip-sync video already
     * contains the speech audio.
     */

    let speech = null;

    if (
      audioMode === "speech" ||
      audioMode === "both"
    ) {
      console.log(
        "🗣️ TALKING VIDEO DETECTED"
      );

      console.log(
        "🗣️ Generating actual dialogue..."
      );

      speech =
        await generateSpeechForVideo({
          prompt,
        });

      if (!speech?.success) {
        throw new Error(
          speech?.error ||
          "Could not generate speech."
        );
      }

      console.log(
        "🗣️ SPEECH SCRIPT:",
        speech.script
      );

      if (
        !speech.audioBuffer ||
        !speech.audioBuffer.length
      ) {
        throw new Error(
          "Speech generation returned no audio."
        );
      }

      console.log(
        "✅ SPEECH AUDIO GENERATED:",
        speech.audioBuffer.length,
        "bytes"
      );

      /**
       * ==============================================
       * LIP SYNC
       * ==============================================
       */

      console.log(
        "👄 Starting lip synchronization..."
      );

      const synced =
        await lipSyncVideo({
          videoUrl:
            originalVideoUrl,

          audioBuffer:
            speech.audioBuffer,
        });

      if (
        !synced?.success ||
        !synced?.videoUrl
      ) {
        throw new Error(
          synced?.error ||
          "Could not synchronize speech with video."
        );
      }

      console.log(
        "✅ LIP-SYNC COMPLETE:",
        synced.videoUrl
      );

      /**
       * IMPORTANT:
       *
       * Kling's output is now the master video.
       *
       * It contains:
       *
       * VIDEO
       * +
       * SYNCHRONIZED SPEECH
       */

      speech.syncedVideoUrl =
        synced.videoUrl;
    }

    /**
     * ================================================
     * BACKGROUND MUSIC
     * ================================================
     */

    let musicResult =
      null;

    let musicUrl =
      null;

    if (
      audioMode === "music" ||
      audioMode === "both"
    ) {
      console.log(
        "🎵 Generating instrumental background music..."
      );

      musicResult =
        await generateMusic({
          prompt,

          style:
            style ||
            "Cinematic contemporary African instrumental, energetic, uplifting, futuristic, premium technology commercial",

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

      if (
        !musicResult?.success
      ) {
        throw new Error(
          musicResult?.error ||
          "Suno music generation failed."
        );
      }

      musicUrl =
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
    }

    /**
     * ================================================
     * SPEECH + MUSIC
     * ================================================
     */

    if (
      audioMode === "both"
    ) {
      console.log(
        "🎬🎙️🎵 CREATING FINAL VIDEO:"
      );

      console.log(
        "   VIDEO → Kling lip-sync"
      );

      console.log(
        "   SPEECH → Already inside lip-sync video"
      );

      console.log(
        "   MUSIC → Mixed underneath speech"
      );

      const merged =
        await mergeSpeechAndMusic({
          videoUrl:
            speech.syncedVideoUrl,

          musicUrl,
        });

      return {
        success: true,

        provider:
          "video-with-speech-and-music",

        videoUrl:
          merged.finalVideoUrl,

        finalVideoUrl:
          merged.finalVideoUrl,

        originalVideoUrl,

        lipSyncedVideoUrl:
          speech.syncedVideoUrl,

        audioEnabled:
          true,

        audioType:
          "speech+music",

        script:
          speech.script,

        musicTaskId:
          musicResult?.musicTaskId ||
          null,

        duration,

        message:
          "Zuri generated a video with synchronized speech and background music.",
      };
    }

    /**
     * ================================================
     * SPEECH ONLY
     * ================================================
     */

    if (
      audioMode === "speech"
    ) {
      console.log(
        "🗣️ RETURNING LIP-SYNCED SPEECH VIDEO..."
      );

      const speechVideo =
        await returnSpeechVideo({
          videoUrl:
            speech.syncedVideoUrl,
        });

      return {
        success: true,

        provider:
          "video-with-speech",

        videoUrl:
          speechVideo.finalVideoUrl,

        finalVideoUrl:
          speechVideo.finalVideoUrl,

        originalVideoUrl,

        lipSyncedVideoUrl:
          speech.syncedVideoUrl,

        audioEnabled:
          true,

        audioType:
          "speech",

        script:
          speech.script,

        duration,
      };
    }

    /**
     * ================================================
     * MUSIC ONLY
     * ================================================
     */

    if (
      audioMode === "music"
    ) {
      console.log(
        "🎵 Creating final music video..."
      );

      const merged =
        await mergeMusicOnly({
          videoUrl:
            originalVideoUrl,

          musicUrl,
        });

      return {
        success: true,

        provider:
          "video-with-music",

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
          null,

        duration,
      };
    }

    /**
     * ================================================
     * FALLBACK
     * ================================================
     */

    return {
      success: true,

      provider:
        "video",

      videoUrl:
        originalVideoUrl,

      finalVideoUrl:
        originalVideoUrl,

      originalVideoUrl,

      audioEnabled:
        false,

      audioType:
        "none",

      duration,
    };

  } catch (error) {
    console.error(
      "❌ VIDEO + AUDIO GENERATION ERROR:",
      error
    );

    return {
      success: false,

      provider:
        "video-with-audio",

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