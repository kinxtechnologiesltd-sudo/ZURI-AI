import { fal } from "@fal-ai/client";
import dotenv from "dotenv";

dotenv.config();

const MODEL =
  "fal-ai/kling-video/lipsync/audio-to-video";

function configureFal() {
  const key =
    String(
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

export async function lipSyncVideo({
  videoUrl,
  audioBuffer,
}) {
  try {
    if (!videoUrl) {
      throw new Error(
        "Lip-sync requires a video URL."
      );
    }

    if (!audioBuffer?.length) {
      throw new Error(
        "Lip-sync requires speech audio."
      );
    }

    configureFal();

    console.log(
      "📤 Uploading speech audio to Fal..."
    );

    const audioFile =
      new File(
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
      "🎙️ AUDIO URL:",
      audioUrl
    );

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
            if (
              update.status ===
              "IN_PROGRESS"
            ) {
              console.log(
                "👄 Lip-sync processing..."
              );

              if (
                Array.isArray(
                  update.logs
                )
              ) {
                update.logs
                  .map(
                    (log) =>
                      log.message
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
            }
          },
        }
      );

    const output =
      result?.data?.video?.url ||
      result?.data?.video_url ||
      null;

    if (!output) {
      console.error(
        "❌ FAL LIP-SYNC RESPONSE:",
        result?.data
      );

      throw new Error(
        "Fal lip-sync did not return a video URL."
      );
    }

    console.log(
      "✅ LIP-SYNC VIDEO READY:",
      output
    );

    return {
      success: true,
      provider: "fal-kling-lipsync",
      videoUrl: output,
      audioUrl,
      requestId:
        result?.requestId ||
        null,
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
      provider: "fal-kling-lipsync",
      videoUrl: null,
      error:
        error instanceof Error
          ? error.message
          : "Lip-sync failed.",
    };
  }
}