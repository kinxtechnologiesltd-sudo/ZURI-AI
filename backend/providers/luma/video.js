import { ENV } from "../../config/environment.js";

const BASE_URL =
  "https://agents.lumalabs.ai/v1";

console.log(
  "🔥 LUMA AGENTS VIDEO PROVIDER LOADED"
);

/**
 * =====================================================
 * GET LUMA GENERATION STATUS
 * =====================================================
 */

export async function getLumaVideoStatus(
  taskId
) {
  try {
    const apiKey =
      String(
        ENV.LUMA_API_KEY || ""
      ).trim();

    if (!apiKey) {
      throw new Error(
        "LUMA_API_KEY is missing."
      );
    }

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
      job
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
          job?.detail ||
          job?.message ||
          "Unable to check Luma generation.",

        raw: job,
      };
    }

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

    const state =
      String(
        job?.state ||
        ""
      ).toLowerCase();

    if (
      state ===
        "completed" &&
      videoUrl
    ) {
      console.log(
        "✅ LUMA VIDEO READY:",
        videoUrl
      );

      return {
        success: true,
        provider: "luma",
        taskId,
        status: "completed",
        videoUrl,
        raw: job,
      };
    }

    if (
      state ===
        "failed"
    ) {
      return {
        success: false,
        provider: "luma",
        taskId,
        status: "failed",

        error:
          job?.failure_reason ||
          "Luma video generation failed.",

        failureCode:
          job?.failure_code ||
          null,

        raw: job,
      };
    }

    return {
      success: true,
      provider: "luma",
      taskId,

      status:
        job?.state ||
        "queued",

      videoUrl: null,

      raw: job,
    };

  } catch (error) {
    console.error(
      "❌ Luma status error:",
      error
    );

    return {
      success: false,
      provider: "luma",
      taskId,
      status: "ERROR",

      error:
        error instanceof Error
          ? error.message
          : "Luma status check failed.",
    };
  }
}

/**
 * =====================================================
 * WAIT FOR LUMA VIDEO
 * =====================================================
 */

export async function waitForLumaVideo(
  taskId,
  {
    intervalMs = 5000,
    maxAttempts = 60,
  } = {}
) {
  if (!taskId) {
    return {
      success: false,
      provider: "luma",
      status: "ERROR",
      videoUrl: null,
      error:
        "Luma taskId is required.",
    };
  }

  console.log(
    "🎬 Waiting for Luma video:",
    taskId
  );

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    console.log(
      `🎬 Luma check (${attempt}/${maxAttempts})`
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
    provider: "luma",
    taskId,
    status: "TIMEOUT",
    videoUrl: null,
    error:
      "Luma video generation timed out.",
  };
}

/**
 * =====================================================
 * CREATE LUMA VIDEO
 * =====================================================
 */

export async function generateLumaVideo({
  prompt,
  aspectRatio = "16:9",
  duration = "5s",
  resolution = "720p",
  image = null,
}) {
  try {
    const apiKey =
      String(
        ENV.LUMA_API_KEY || ""
      ).trim();

    if (!apiKey) {
      throw new Error(
        "LUMA_API_KEY is missing."
      );
    }

    console.log(
      "🔑 LUMA API KEY LOADED:",
      Boolean(apiKey)
    );

    console.log(
      "🔑 LUMA KEY FORMAT:",
      apiKey.startsWith(
        "luma-api-"
      )
        ? "Agents API"
        : "Unknown"
    );

    /**
     * ==========================================
     * REQUEST
     * ==========================================
     */

    const safeDuration = "10s";

const body = {
  model: "ray-3.2",
  type: "video",
  prompt,
  aspect_ratio: aspectRatio,
  video: {
    resolution,
    duration: safeDuration,
  },
};

    if (image) {
      body.image_ref = [
        {
          url: image,
        },
      ];
    }

    console.log(
      "🎬 LUMA AGENTS REQUEST:"
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
          method: "POST",

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
        rawText: text,
      };
    }

    console.log(
      "🎬 LUMA AGENTS HTTP STATUS:",
      response.status
    );

    console.log(
      "🎬 LUMA AGENTS RAW RESPONSE:"
    );

    console.dir(
      job,
      {
        depth: null,
      }
    );

    if (!response.ok) {
      return {
        success: false,
        provider: "luma",
        status:
          response.status,

        error:
          job?.detail ||
          job?.message ||
          "Luma video generation failed.",

        raw: job,
      };
    }

    const taskId =
      job?.id ||
      null;

    if (!taskId) {
      return {
        success: false,
        provider: "luma",
        status: "ERROR",
        error:
          "Luma did not return a generation ID.",
        raw: job,
      };
    }

    /**
     * ==========================================
     * WAIT UNTIL COMPLETED
     * ==========================================
     */

    const completed =
      await waitForLumaVideo(
        taskId
      );

    return {
      ...completed,

      provider:
        "luma",

      taskId,

      duration,

      raw:
        completed?.raw ||
        job,
    };

  } catch (error) {
    console.error(
      "❌ Luma generation error:",
      error
    );

    return {
      success: false,
      provider: "luma",
      status: "ERROR",

      error:
        error instanceof Error
          ? error.message
          : "Luma video generation failed.",
    };
  }
}