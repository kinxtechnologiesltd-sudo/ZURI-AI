import { execFile } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";

const execFileAsync =
  promisify(execFile);

export async function mergeVideoAndAudio({
  videoUrl,
  audioUrl,
}) {
  if (!videoUrl) {
    throw new Error(
      "Video URL is required."
    );
  }

  if (!audioUrl) {
    throw new Error(
      "Audio URL is required."
    );
  }

  const tempDir =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "zuri-media-"
      )
    );

  const videoPath =
    path.join(
      tempDir,
      "video.mp4"
    );

  const audioPath =
    path.join(
      tempDir,
      "audio.mp3"
    );

  const outputPath =
    path.join(
      tempDir,
      "final.mp4"
    );

  try {
    console.log(
      "🎬 Downloading video..."
    );

    const videoResponse =
      await fetch(videoUrl);

    if (!videoResponse.ok) {
      throw new Error(
        `Unable to download video: ${videoResponse.status}`
      );
    }

    await fs.writeFile(
      videoPath,
      Buffer.from(
        await videoResponse.arrayBuffer()
      )
    );

    console.log(
      "🎵 Downloading audio..."
    );

    const audioResponse =
      await fetch(audioUrl);

    if (!audioResponse.ok) {
      throw new Error(
        `Unable to download audio: ${audioResponse.status}`
      );
    }

    await fs.writeFile(
      audioPath,
      Buffer.from(
        await audioResponse.arrayBuffer()
      )
    );

    console.log(
      "🎬🎵 Merging video and audio..."
    );

    await execFileAsync(
      "ffmpeg",
      [
        "-y",

        "-i",
        videoPath,

        "-i",
        audioPath,

        "-map",
        "0:v:0",

        "-map",
        "1:a:0",

        "-c:v",
        "copy",

        "-c:a",
        "aac",

        "-b:a",
        "192k",

        "-shortest",

        "-movflags",
        "+faststart",

        outputPath,
      ]
    );

    const finalBuffer =
      await fs.readFile(
        outputPath
      );

    console.log(
      "✅ Video/audio merge complete."
    );

    return finalBuffer;

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