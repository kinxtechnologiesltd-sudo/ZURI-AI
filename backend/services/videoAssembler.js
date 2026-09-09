import { randomUUID } from "crypto";
import ffmpegStatic from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import os from "os";
import path from "path";

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

/**
 * =====================================================
 * ASSEMBLE VIDEO CLIPS
 * =====================================================
 *
 * Takes generated MP4 clips and joins them into one
 * continuous MP4 video.
 */

export async function assembleVideoClips(
  clipPaths,
  {
    outputFormat = "mp4",
  } = {}
) {
  if (
    !Array.isArray(clipPaths) ||
    clipPaths.length === 0
  ) {
    throw new Error(
      "No video clips were provided."
    );
  }

  if (!ffmpegStatic) {
    throw new Error(
      "FFmpeg could not be located."
    );
  }

  const workDir =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "zuri-video-"
      )
    );

  const outputPath =
    path.join(
      workDir,
      `${randomUUID()}.${outputFormat}`
    );

  try {
    /**
     * ================================================
     * VERIFY CLIPS
     * ================================================
     */

    for (
      const clipPath of clipPaths
    ) {
      try {
        const stat =
          await fs.stat(
            clipPath
          );

        if (
          !stat.isFile() ||
          stat.size === 0
        ) {
          throw new Error(
            `Invalid or empty video clip: ${clipPath}`
          );
        }
      } catch (error) {
        throw new Error(
          `Video clip does not exist: ${clipPath}`
        );
      }
    }

    /**
     * ================================================
     * CREATE FFMPEG CONCAT FILE
     * ================================================
     */

    const concatPath =
      path.join(
        workDir,
        "concat.txt"
      );

    const concatContent =
      clipPaths
        .map((clipPath) => {
          const normalized =
            path
              .resolve(clipPath)
              .replace(/\\/g, "/")
              .replace(/'/g, "'\\''");

          return `file '${normalized}'`;
        })
        .join("\n");

    await fs.writeFile(
      concatPath,
      concatContent,
      "utf8"
    );

    console.log(
      "🎞️ CONCAT FILE CREATED:"
    );

    console.log(
      concatPath
    );

    /**
     * ================================================
     * ASSEMBLE WITH FFMPEG
     * ================================================
     */

    await new Promise(
      (resolve, reject) => {
        ffmpeg()
          .input(
            concatPath
          )

          .inputOptions([
            "-f",
            "concat",
            "-safe",
            "0",
          ])

          .outputOptions([
            "-c",
            "copy",
            "-movflags",
            "+faststart",
          ])

          .output(
            outputPath
          )

          .on(
            "start",
            (command) => {
              console.log(
                "🎞️ FFmpeg started:"
              );

              console.log(
                command
              );
            }
          )

          .on(
            "progress",
            (progress) => {
              if (
                progress?.percent != null
              ) {
                console.log(
                  "🎞️ FFmpeg progress:",
                  `${progress.percent.toFixed(
                    1
                  )}%`
                );
              }
            }
          )

          .on(
            "end",
            () => {
              console.log(
                "🎞️ FFmpeg assembly finished."
              );

              resolve();
            }
          )

          .on(
            "error",
            (error) => {
              console.error(
                "❌ FFmpeg assembly failed:",
                error
              );

              reject(
                error
              );
            }
          )

          .run();
      }
    );

    /**
     * ================================================
     * VERIFY OUTPUT
     * ================================================
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
        "FFmpeg produced an empty assembled video."
      );
    }

    console.log(
      "✅ VIDEO ASSEMBLY COMPLETE:"
    );

    console.log(
      outputPath
    );

    console.log(
      "📦 FINAL VIDEO SIZE:",
      stat.size,
      "bytes"
    );

    return {
      success: true,
      outputPath,
    };

  } catch (error) {
    console.error(
      "❌ FFmpeg assembly error:",
      error
    );

    throw error;

  } finally {
    /**
     * Keep the output video,
     * remove only the temporary
     * concat workspace.
     */

    try {
      await fs.rm(
        concatPath,
        {
          force: true,
        }
      );
    } catch {
      // Ignore cleanup errors.
    }
  }
}