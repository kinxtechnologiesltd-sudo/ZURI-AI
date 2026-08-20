import { ENV } from "../../config/environment.js";

const BASE_URL =
  "https://api.sunoapi.org";

function extractAudioData(result) {
  const data = result?.data;

  if (!data) {
    return {
      audioUrl: null,
      title: null,
    };
  }

  const tracks =
    data?.data ||
    data?.response?.sunoData ||
    data?.response?.data ||
    data?.sunoData ||
    [];

  const firstTrack =
    Array.isArray(tracks)
      ? tracks[0]
      : null;

  return {
    audioUrl:
      firstTrack?.audio_url ||
      firstTrack?.audioUrl ||
      data?.audio_url ||
      data?.audioUrl ||
      null,

    title:
      firstTrack?.title ||
      data?.title ||
      null,
  };
}

export async function getSunoStatus(taskId) {
  try {
    if (!ENV.SUNO_API_KEY) {
      throw new Error(
        "SUNO_API_KEY is missing."
      );
    }

    if (!taskId) {
      throw new Error(
        "Suno taskId is required."
      );
    }

    const response =
      await fetch(
        `${BASE_URL}/api/v1/generate/record-info?taskId=${encodeURIComponent(
          taskId
        )}`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${ENV.SUNO_API_KEY}`,
            "Content-Type":
              "application/json",
          },
        }
      );

    const result =
      await response.json();

    console.log(
      "🎵 RAW SUNO STATUS:",
      JSON.stringify(
        result,
        null,
        2
      )
    );

    if (!response.ok) {
      return {
        success: false,
        provider: "suno",
        taskId,
        status: "ERROR",
        audioUrl: null,
        error:
          result?.msg ||
          result?.message ||
          "Unable to check Suno status.",
        raw: result,
      };
    }

    /**
     * Suno returned no task data.
     * Do NOT treat this as a normal PENDING state.
     */
    if (result?.data === null) {
      return {
        success: false,
        provider: "suno",
        taskId,
        status: "NO_DATA",
        audioUrl: null,
        title: null,
        error:
          "Suno returned no task data for this task ID.",
        raw: result,
      };
    }

    const status =
      result?.data?.status ||
      result?.data?.state ||
      result?.status ||
      result?.state ||
      "UNKNOWN";

    const media =
      extractAudioData(
        result
      );

    console.log(
      "🎵 EXTRACTED SUNO AUDIO:",
      media
    );

    return {
      success: true,
      provider: "suno",
      taskId,
      status,
      audioUrl:
        media.audioUrl,
      title:
        media.title,
      raw: result,
    };

  } catch (error) {
    console.error(
      "Suno status error:",
      error
    );

    return {
      success: false,
      provider: "suno",
      taskId,
      status: "ERROR",
      audioUrl: null,
      error:
        error instanceof Error
          ? error.message
          : "Unable to check Suno status.",
    };
  }
}