import { randomUUID } from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";

/**
 * =====================================================
 * DOWNLOAD GENERATED VIDEO
 * =====================================================
 *
 * Downloads a completed video from a provider URL
 * and saves it as a local MP4 file.
 */

export async function downloadVideo(
  videoUrl,
  {
    filename = null,
  } = {}
) {
  if (!videoUrl) {
    throw new Error(
      "Video URL is required."
    );
  }

  console.log(
    "⬇️ Downloading video:",
    videoUrl
  );

  const workDir =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "zuri-video-"
      )
    );

  const safeFilename =
    filename ||
    `${randomUUID()}.mp4`;

  const outputPath =
    path.join(
      workDir,
      safeFilename
    );

  try {
    const response =
      await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(
        `Video download failed: HTTP ${response.status}`
      );
    }

    const buffer =
      Buffer.from(
        await response.arrayBuffer()
      );

    if (!buffer.length) {
      throw new Error(
        "Downloaded video is empty."
      );
    }

    await fs.writeFile(
      outputPath,
      buffer
    );

    console.log(
      "✅ Video downloaded:",
      outputPath
    );

    console.log(
      "📦 Video size:",
      `${(
        buffer.length /
        1024 /
        1024
      ).toFixed(2)} MB`
    );

    return {
      success: true,
      path: outputPath,
      size: buffer.length,
    };

  } catch (error) {
    console.error(
      "❌ Video download error:",
      error
    );

    /**
     * Clean up partially downloaded file.
     */
    try {
      await fs.unlink(
        outputPath
      );
    } catch {
      // Ignore cleanup errors.
    }

    throw error;
  }
}