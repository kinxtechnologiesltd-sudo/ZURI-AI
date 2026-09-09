import { fal } from "@fal-ai/client";
import dotenv from "dotenv";

dotenv.config();

const MODEL =
  "fal-ai/kling-video/lipsync/audio-to-video";

/**
 * =====================================================
 * CONFIGURE FAL
 * =====================================================
 */

function configureFal() {
  const key = String(
    process.env.FAL_KEY ||
    process.env.FAL_API_KEY ||
    ""
  ).trim();

  if (!key) {
    throw new Error(
      "FAL_KEY is missing from environment variables."
    );
  }

  fal.config({
    credentials: key,
  });
}

/**
 * =====================================================
 * LIP-SYNC VIDEO
 * =====================================================
 *
 * IMPORTANT:
 *
 * audioBuffer should contain the FINAL AUDIO TRACK.
 *
 * That means:
 *
 *   speech
 *   +
 *   background music
 *   +
 *   ambient/crowd sound
 *
 * should already be mixed together before this
 * function is called.
 *
 * Kling will use the speech contained in that
 * audio track to synchronize the person's mouth.
 */

export async function lipSyncVideo({
  videoUrl,
  audioBuffer,
  audioMimeType = "audio/mpeg",
  audioFileName = "zuri-final-audio.mp3",
}) {
  try {
    /**
     * ==========================================
     * VALIDATE INPUT
     * ==========================================
     */

    if (!videoUrl) {
      throw new Error(
        "Lip-sync requires a video URL."
      );
    }

    if (!audioBuffer?.length) {
      throw new Error(
        "Lip-sync requires a final audio buffer."
      );
    }

    configureFal();

    console.log(
      "========================================="
    );

    console.log(
      "👄 ZURI LIP-SYNC STARTED"
    );

    console.log(
      "🎬 Video:",
      videoUrl
    );

    console.log(
      "🎵 Audio file:",
      audioFileName
    );

    console.log(
      "🎵 Audio type:",
      audioMimeType
    );

    console.log(
      "🎵 Audio size:",
      audioBuffer.length,
      "bytes"
    );

    /**
     * ==========================================
     * UPLOAD FINAL AUDIO
     * ==========================================
     *
     * This audio should already contain:
     *
     * speech + music + ambience
     */

    console.log(
      "📤 Uploading final audio to Fal..."
    );

    const audioFile = new File(
      [audioBuffer],
      audioFileName,
      {
        type: audioMimeType,
      }
    );

    const audioUrl =
      await fal.storage.upload(
        audioFile
      );

    if (!audioUrl) {
      throw new Error(
        "Fal did not return an audio URL."
      );
    }

    console.log(
      "🎵 FINAL AUDIO URL:",
      audioUrl
    );

    /**
     * ==========================================
     * START KLING LIP-SYNC
     * ==========================================
     */

    console.log(
      "👄 Starting Kling lip-sync..."
    );

    const result =
      await fal.subscribe(
        MODEL,
        {
          input: {
            video_url: videoUrl,
            audio_url: audioUrl,
          },

          logs: true,

          onQueueUpdate(update) {
            console.log(
              "👄 KLING STATUS:",
              update.status
            );

            if (
              Array.isArray(
                update.logs
              )
            ) {
              update.logs
                .map(
                  (log) =>
                    log?.message
                )
                .filter(Boolean)
                .forEach(
                  (message) =>
                    console.log(
                      "   ",
                      message
                    )
                );
            }
          },
        }
      );

    /**
     * ==========================================
     * EXTRACT VIDEO URL
     * ==========================================
     */

    const output =
      result?.data?.video?.url ||
      result?.data?.video_url ||
      result?.data?.url ||
      null;

    if (!output) {
      console.error(
        "❌ FAL KLING RESPONSE:"
      );

      console.dir(
        result?.data || result,
        {
          depth: null,
        }
      );

      throw new Error(
        "Fal lip-sync did not return a video URL."
      );
    }

    /**
     * ==========================================
     * SUCCESS
     * ==========================================
     */

    console.log(
      "========================================="
    );

    console.log(
      "✅ LIP-SYNC VIDEO READY"
    );

    console.log(
      "🎬 VIDEO:",
      output
    );

    console.log(
      "🎵 AUDIO:",
      audioUrl
    );

    console.log(
      "========================================="
    );

    return {
      success: true,

      provider:
        "fal-kling-lipsync",

      videoUrl:
        output,

      audioUrl,

      requestId:
        result?.requestId ||
        null,

      /**
       * Tell the rest of Athena that this
       * video contains the final audio track.
       */

      hasAudio: true,

      audioType:
        "speech+music+ambience",

      raw:
        result?.data ||
        result,
    };

  } catch (error) {
    console.error(
      "❌ LIP-SYNC ERROR:",
      error
    );

    return {
      success: false,

      provider:
        "fal-kling-lipsync",

      videoUrl:
        null,

      audioUrl:
        null,

      hasAudio:
        false,

      error:
        error instanceof Error
          ? error.message
          : "Lip-sync failed.",
    };
  }
}