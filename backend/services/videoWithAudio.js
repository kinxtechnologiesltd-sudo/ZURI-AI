import { execFile } from "child_process";
import crypto from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";

import { fal } from "@fal-ai/client";
import OpenAI from "openai";

import { generateMusic } from "./musicGeneration.js";
import { generateVideo } from "./videoGeneration.js";

const execFileAsync = promisify(execFile);

/* =====================================================
   PATHS
===================================================== */

const generatedDir = path.resolve(
  process.cwd(),
  "generated"
);

/* =====================================================
   FFMPEG
===================================================== */

const FFMPEG_PATH =
  process.env.FFMPEG_PATH ||
  "C:\\Users\\USER\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0-full_build\\bin\\ffmpeg.exe";

/* =====================================================
   ENVIRONMENT
===================================================== */

const OPENAI_API_KEY = String(
  process.env.OPENAI_API_KEY || ""
).trim();

const FAL_KEY = String(
  process.env.FAL_KEY ||
    process.env.FAL_API_KEY ||
    ""
).trim();

const openai = OPENAI_API_KEY
  ? new OpenAI({
      apiKey: OPENAI_API_KEY,
    })
  : null;

/* =====================================================
   PUBLIC BACKEND URL
===================================================== */

const PUBLIC_BASE_URL =
  process.env.BACKEND_PUBLIC_URL ||
  `http://localhost:${process.env.PORT || 3001}`;

/* =====================================================
   LIP-SYNC MODEL
===================================================== */

const LIP_SYNC_MODEL =
  "fal-ai/kling-video/lipsync/audio-to-video";

/* =====================================================
   EXTRACT VIDEO DURATION
===================================================== */

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

/* =====================================================
   DETECT TALKING VIDEO
===================================================== */

function isTalkingVideoRequest(prompt) {
  const text = String(prompt || "").toLowerCase();

  const talkingPattern =
    /\b(talking|talk|speaks|speaking|speak|says|saying|narrator|narration|interview|interviewer|presenter|presentation|explains|explain|tells|telling|dialogue|conversation|voiceover|voice-over|lip.?sync|lipsync|mouth movements|talking character|talking person|person talking|woman talking|man talking|character talking|someone talking)\b/i;

  return talkingPattern.test(text);
}

/* =====================================================
   DETECT AUDIO TYPE
===================================================== */

function detectAudioType(prompt) {
  const text = String(prompt || "")
    .trim()
    .toLowerCase();

  const silencePattern =
    /\b(silent|silence|mute|muted|no sound|no audio|without sound|without audio|remove audio|remove the sound)\b/i;

  if (silencePattern.test(text)) {
    return "none";
  }

  if (isTalkingVideoRequest(text)) {
    return "speech";
  }

  const musicPattern =
    /\b(song|music|afrobeat|afropop|rap|beat|instrumental|singing|singer|vocals?|soundtrack)\b/i;

  if (musicPattern.test(text)) {
    return "music";
  }

  return "music";
}

/* =====================================================
   FIND BEST AUDIO URL
===================================================== */

function extractAudioUrl(musicResult) {
  if (!musicResult) {
    return null;
  }

  const candidates = [
    musicResult.sourceAudioUrl,
    musicResult.source_audio_url,
    musicResult.audioUrl,
    musicResult.audio_url,
    musicResult.sourceStreamAudioUrl,
    musicResult.source_stream_audio_url,
    musicResult.streamAudioUrl,
    musicResult.stream_audio_url,

    musicResult.raw?.sourceAudioUrl,
    musicResult.raw?.source_audio_url,
    musicResult.raw?.audioUrl,
    musicResult.raw?.audio_url,

    musicResult.raw?.data?.sourceAudioUrl,
    musicResult.raw?.data?.source_audio_url,
    musicResult.raw?.data?.audioUrl,
    musicResult.raw?.data?.audio_url,

    musicResult.raw?.data?.response?.sourceAudioUrl,
    musicResult.raw?.data?.response?.source_audio_url,
    musicResult.raw?.data?.response?.audioUrl,
    musicResult.raw?.data?.response?.audio_url,

    musicResult.raw?.data?.response?.sunoData?.[0]
      ?.sourceAudioUrl,

    musicResult.raw?.data?.response?.sunoData?.[0]
      ?.audioUrl,

    musicResult.raw?.data?.response?.data?.[0]
      ?.sourceAudioUrl,

    musicResult.raw?.data?.response?.data?.[0]
      ?.audioUrl,

    musicResult.raw?.data?.data?.[0]
      ?.sourceAudioUrl,

    musicResult.raw?.data?.data?.[0]
      ?.audioUrl,
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      candidate.startsWith("http")
    ) {
      return candidate;
    }
  }

  return null;
}

/* =====================================================
   CREATE SPEECH SCRIPT
===================================================== */

async function createSpeechScript(prompt) {
  if (!openai) {
    throw new Error(
      "OPENAI_API_KEY is missing."
    );
  }

  console.log(
    "🗣️ Creating dialogue for talking video..."
  );

  const response =
    await openai.responses.create({
      model:
        process.env.OPENAI_TEXT_MODEL ||
        "gpt-4o-mini",

      input: [
        {
          role: "system",
          content: `
You write short natural dialogue for AI talking videos.

Convert the user's video request into exactly what
the character should SAY.

Rules:
- Return only spoken dialogue.
- No title.
- No quotation marks.
- No markdown.
- No stage directions.
- Do not describe the scene.
- Do not say "Here is the script".
- Keep it natural and conversational.
- Keep it short enough for a 10 second video unless
  the user explicitly asks for something longer.
- If the user asks someone to talk about Zuri,
  make the dialogue naturally explain or promote Zuri.
          `.trim(),
        },
        {
          role: "user",
          content: String(prompt || ""),
        },
      ],

      max_output_tokens: 220,
    });

  const script = String(
    response.output_text || ""
  ).trim();

  if (!script) {
    throw new Error(
      "No speech script was generated."
    );
  }

  console.log(
    "🗣️ GENERATED SCRIPT:",
    script
  );

  return script;
}

/* =====================================================
   GENERATE ACTUAL SPEECH AUDIO
===================================================== */

async function generateSpeech(prompt) {
  if (!openai) {
    throw new Error(
      "OPENAI_API_KEY is missing."
    );
  }

  const script =
    await createSpeechScript(prompt);

  console.log(
    "🎙️ Generating actual spoken audio..."
  );

  const speech =
    await openai.audio.speech.create({
      model:
        process.env.OPENAI_TTS_MODEL ||
        "gpt-4o-mini-tts",

      voice:
        process.env.OPENAI_TTS_VOICE ||
        "coral",

      input: script,

      response_format: "mp3",
    });

  const audioBuffer = Buffer.from(
    await speech.arrayBuffer()
  );

  if (!audioBuffer.length) {
    throw new Error(
      "OpenAI returned empty speech audio."
    );
  }

  console.log(
    "✅ SPEECH AUDIO CREATED:",
    audioBuffer.length,
    "bytes"
  );

  return {
    script,
    audioBuffer,
  };
}

/* =====================================================
   KLING LIP-SYNC
===================================================== */

async function createLipSyncVideo({
  videoUrl,
  audioBuffer,
}) {
  if (!FAL_KEY) {
    throw new Error(
      "FAL_KEY is missing from environment variables."
    );
  }

  if (!videoUrl) {
    throw new Error(
      "Lip-sync requires a video URL."
    );
  }

  if (
    !audioBuffer ||
    !audioBuffer.length
  ) {
    throw new Error(
      "Lip-sync requires speech audio."
    );
  }

  fal.config({
    credentials: FAL_KEY,
  });

  console.log(
    "📤 Uploading speech audio to Fal..."
  );

  const audioFile = new File(
    [audioBuffer],
    "zuri-speech.mp3",
    {
      type: "audio/mpeg",
    }
  );

  const audioUrl =
    await fal.storage.upload(
      audioFile
    );

  console.log(
    "🎙️ FAL AUDIO URL:",
    audioUrl
  );

  console.log(
    "👄 Starting Kling lip-sync..."
  );

  const result =
    await fal.subscribe(
      LIP_SYNC_MODEL,
      {
        input: {
          video_url: videoUrl,
          audio_url: audioUrl,
        },

        logs: true,

        onQueueUpdate(update) {
          if (
            update?.status ===
            "IN_PROGRESS"
          ) {
            console.log(
              "👄 Kling lip-sync processing..."
            );
          }
        },
      }
    );

  console.log(
    "👄 FAL LIP-SYNC RESULT:"
  );

  console.dir(
    result?.data || result,
    {
      depth: null,
    }
  );

  const syncedVideoUrl =
    result?.data?.video?.url ||
    result?.data?.video_url ||
    result?.video?.url ||
    null;

  if (!syncedVideoUrl) {
    throw new Error(
      "Kling lip-sync completed but no video URL was returned."
    );
  }

  console.log(
    "✅ LIP-SYNC VIDEO READY:",
    syncedVideoUrl
  );

  return {
    videoUrl: syncedVideoUrl,
    audioUrl,
    raw: result?.data || result,
  };
}

/* =====================================================
   DOWNLOAD REMOTE FILE
===================================================== */

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

      const response =
        await fetch(url, {
          method: "GET",

          signal:
            controller.signal,

          headers: {
            Accept: "*/*",
            "User-Agent": "Zuri/1.0",
          },
        });

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
        const delay =
          Math.min(
            2000 * attempt,
            10000
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

/* =====================================================
   ZURI WATERMARK
===================================================== */

function getWatermarkFilter() {
  return (
    "drawtext=" +
    "text='ZURI':" +
    "fontfile='C\\:/Windows/Fonts/arial.ttf':" +
    "fontcolor=white@0.60:" +
    "fontsize=24:" +
    "x=w-tw-28:" +
    "y=h-th-28:" +
    "box=1:" +
    "boxcolor=black@0.25:" +
    "boxborderw=7"
  );
}

/* =====================================================
   PROCESS VIDEO WITH FFMPEG
===================================================== */

async function processVideo({
  videoUrl,
  audioUrl = null,
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
      "video-input.mp4"
    );

  const audioPath =
    path.join(
      tempDir,
      "audio.mp3"
    );

  const outputName =
    `zuri-${crypto.randomUUID()}.mp4`;

  const outputPath =
    path.join(
      generatedDir,
      outputName
    );

  try {
    console.log(
      "🎬 Downloading video..."
    );

    await downloadFile(
      videoUrl,
      videoPath,
      {
        retries: 5,
        timeoutMs: 180000,
      }
    );

    const filter =
      getWatermarkFilter();

    const ffmpegArgs = [
      "-y",

      "-i",
      videoPath,
    ];

    if (audioUrl) {
      console.log(
        "🎵 Downloading audio..."
      );

      await downloadFile(
        audioUrl,
        audioPath,
        {
          retries: 5,
          timeoutMs: 180000,
        }
      );

      ffmpegArgs.push(
        "-i",
        audioPath
      );
    }

    ffmpegArgs.push(
      "-map",
      "0:v:0"
    );

    if (audioUrl) {
      ffmpegArgs.push(
        "-map",
        "1:a:0"
      );
    }

    ffmpegArgs.push(
      "-vf",
      filter,

      "-c:v",
      "libx264",

      "-preset",
      "medium",

      "-crf",
      "20"
    );

    if (audioUrl) {
      ffmpegArgs.push(
        "-c:a",
        "aac",

        "-b:a",
        "192k",

        "-shortest"
      );
    } else {
      ffmpegArgs.push(
        "-map",
"0:a:0?",
"-c:a",
"aac",
"-b:a",
"192k",
"-ar",
"44100",
"-ac",
"2",
"-shortest",
      );
    }

    ffmpegArgs.push(
      "-movflags",
      "+faststart",

      outputPath
    );

    console.log(
      "🎬 FFMPEG PATH:",
      FFMPEG_PATH
    );

    console.log(
      "🎬 FFMPEG COMMAND:"
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
      "✅ FINAL WATERMARKED VIDEO:",
      outputPath
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

/* =====================================================
   MAIN VIDEO + AUDIO GENERATOR
===================================================== */

export async function generateVideoWithAudio({
  prompt,
  image = null,
  style = "",
  quality = "standard",
}) {
  try {
    console.log(
      "🎬 Starting Zuri video generation..."
    );

    const duration =
      extractVideoDuration(
        prompt
      );

    console.log(
      "🎬 Requested duration:",
      duration,
      "seconds"
    );

    /* ================================================
       GENERATE VIDEO
    ================================================= */

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

    /* ================================================
       DETECT AUDIO
    ================================================= */

    const audioType =
      detectAudioType(
        prompt
      );

    console.log(
      "🎵 SELECTED AUDIO TYPE:",
      audioType
    );

    /* ================================================
       SILENT VIDEO
    ================================================= */

    if (audioType === "none") {
      console.log(
        "🔇 Silent video requested."
      );

      const processed =
        await processVideo({
          videoUrl:
            originalVideoUrl,

          audioUrl:
            null,
        });

      return {
        success: true,
        provider: "video",

        videoUrl:
          processed.finalVideoUrl,

        finalVideoUrl:
          processed.finalVideoUrl,

        originalVideoUrl,

        audioUrl: null,

        audioEnabled: false,

        audioType: "none",

        musicTaskId: null,
      };
    }

    /* ================================================
       SPEECH + LIP SYNC
    ================================================= */

    if (audioType === "speech") {
      console.log(
        "🗣️ TALKING VIDEO REQUEST DETECTED"
      );

      const speech =
        await generateSpeech(
          prompt
        );

      console.log(
        "🗣️ SPEECH SCRIPT:",
        speech.script
      );

      /*
       * Send the generated video and REAL
       * spoken audio to Kling.
       */
      const synced =
        await createLipSyncVideo({
          videoUrl:
            originalVideoUrl,

          audioBuffer:
            speech.audioBuffer,
        });

      /*
       * Kling already returns the speech
       * inside the lip-synced video.
       *
       * We only add the ZURI watermark.
       */
      const processed =
        await processVideo({
          videoUrl:
            synced.videoUrl,

          audioUrl:
            null,
        });

      return {
        success: true,

        provider:
          "video-with-speech",

        videoUrl:
          processed.finalVideoUrl,

        finalVideoUrl:
          processed.finalVideoUrl,

        originalVideoUrl,

        lipSyncedVideoUrl:
          synced.videoUrl,

        audioUrl:
          synced.audioUrl || null,

        audioEnabled:
          true,

        audioType:
          "speech",

        script:
          speech.script,

        musicTaskId:
          null,
      };
    }

    /* ================================================
       MUSIC
    ================================================= */

    if (audioType === "music") {
      console.log(
        "🎵 Generating Suno music for video..."
      );

      const musicResult =
        await generateMusic({
          prompt,

          style:
            style ||
            "African contemporary music",

          instrumental:
            true,

          title:
            "Zuri Video Soundtrack",

          waitForCompletion:
            true,
        });

      console.log(
        "🎵 COMPLETED MUSIC RESULT:"
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

      const audioUrl =
        extractAudioUrl(
          musicResult
        );

      if (!audioUrl) {
        throw new Error(
          "Suno completed but no usable audio URL was returned."
        );
      }

      console.log(
        "✅ SUNO AUDIO URL:",
        audioUrl
      );

      const processed =
        await processVideo({
          videoUrl:
            originalVideoUrl,

          audioUrl,
        });

      return {
        success: true,

        provider:
          "video-with-audio",

        videoUrl:
          processed.finalVideoUrl,

        finalVideoUrl:
          processed.finalVideoUrl,

        originalVideoUrl,

        audioUrl,

        audioEnabled:
          true,

        audioType:
          "music",

        musicTaskId:
          musicResult.musicTaskId ||
          null,

        title:
          musicResult.title ||
          null,
      };
    }

    /* ================================================
       FALLBACK
    ================================================= */

    const processed =
      await processVideo({
        videoUrl:
          originalVideoUrl,

        audioUrl:
          null,
      });

    return {
      success: true,

      provider:
        "video",

      videoUrl:
        processed.finalVideoUrl,

      finalVideoUrl:
        processed.finalVideoUrl,

      originalVideoUrl,

      audioUrl:
        null,

      audioEnabled:
        false,

      audioType:
        "none",
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