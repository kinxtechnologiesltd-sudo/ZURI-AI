import { ENV } from "../../config/environment.js";

const BASE_URL =
  "https://api.sunoapi.org";

/**
 * =====================================================
 * GENERATE SUNO MUSIC
 * =====================================================
 *
 * This provider supports both:
 *
 * 1. Normal Zuri music generation
 * 2. Video soundtrack generation
 *
 * IMPORTANT:
 *
 * The caller decides whether the generated audio
 * should contain vocals or be instrumental.
 *
 * Video generation MUST pass:
 *
 *     instrumental: true
 *
 * Normal music generation may pass:
 *
 *     instrumental: false
 *
 * Do NOT hardcode instrumental here.
 */

export async function generateSunoMusic({
  prompt,
  style = "",
  instrumental = false,
  title = "Zuri Creation",
}) {
  try {
    /**
     * ================================================
     * ENVIRONMENT CHECK
     * ================================================
     */

    if (!ENV.SUNO_API_KEY) {
      throw new Error(
        "SUNO_API_KEY is missing."
      );
    }

    if (!ENV.SUNO_CALLBACK_URL) {
      throw new Error(
        "SUNO_CALLBACK_URL is missing."
      );
    }

    /**
     * ================================================
     * CLEAN PROMPT
     * ================================================
     */

    const cleanPrompt =
      String(prompt || "")
        .trim()
        .slice(0, 400);

    if (!cleanPrompt) {
      throw new Error(
        "Suno prompt is empty."
      );
    }

    /**
     * ================================================
     * NORMALIZE VALUES
     * ================================================
     */

    const isInstrumental =
      Boolean(instrumental);

    const cleanStyle =
      String(style || "")
        .trim()
        .slice(0, 300);

    const cleanTitle =
      String(title || "Zuri Creation")
        .trim()
        .slice(0, 100);

    /**
     * ================================================
     * SUNO REQUEST BODY
     * ================================================
     *
     * For video generation:
     *
     * instrumental = true
     *
     * This prevents Suno from creating vocals
     * for the video's soundtrack.
     */

    const requestBody = {
      prompt: cleanPrompt,

      customMode: false,

      instrumental:
        isInstrumental,

      model:
        "V4_5",

      callBackUrl:
        ENV.SUNO_CALLBACK_URL,
    };

    /**
     * ================================================
     * LOG IMPORTANT REQUEST DETAILS
     * ================================================
     */

    console.log(
      "================================================="
    );

    console.log(
      "🎵 SUNO GENERATION REQUEST"
    );

    console.log(
      "================================================="
    );

    console.log(
      "🎵 Prompt:",
      cleanPrompt
    );

    console.log(
      "🎵 Instrumental:",
      isInstrumental
    );

    console.log(
      "🎵 Style:",
      cleanStyle || "(none)"
    );

    console.log(
      "🎵 Title:",
      cleanTitle
    );

    console.log(
      "🎵 Callback URL:",
      ENV.SUNO_CALLBACK_URL
    );

    console.log(
      "🎵 SUNO REQUEST BODY:"
    );

    console.log(
      JSON.stringify(
        requestBody,
        null,
        2
      )
    );

    /**
     * ================================================
     * ABORT CONTROLLER
     * ================================================
     */

    const controller =
      new AbortController();

    const timeout =
      setTimeout(() => {
        controller.abort();
      }, 30000);

    try {
      /**
       * ============================================
       * SEND REQUEST
       * ============================================
       */

      console.log(
        "🎵 Sending request to Suno..."
      );

      const response =
        await fetch(
          `${BASE_URL}/api/v1/generate`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${ENV.SUNO_API_KEY}`,

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                requestBody
              ),

            signal:
              controller.signal,
          }
        );

      /**
       * ============================================
       * READ RESPONSE
       * ============================================
       */

      const job =
        await response.json();

      console.log(
        "🎵 SUNO API RAW RESPONSE:"
      );

      console.log(
        JSON.stringify(
          job,
          null,
          2
        )
      );

      /**
       * ============================================
       * HTTP FAILURE
       * ============================================
       */

      if (!response.ok) {
        console.error(
          "❌ Suno HTTP request failed:",
          response.status
        );

        return {
          success: false,

          provider:
            "suno",

          error:
            job?.msg ||
            job?.message ||
            `Suno music generation failed with HTTP ${response.status}.`,

          raw:
            job,
        };
      }

      /**
       * ============================================
       * SUNO API ERROR
       * ============================================
       */

      if (
        job?.code !== undefined &&
        job.code !== 200
      ) {
        console.error(
          "❌ Suno rejected generation request:",
          job
        );

        return {
          success: false,

          provider:
            "suno",

          error:
            job?.msg ||
            job?.message ||
            "Suno rejected the request.",

          raw:
            job,
        };
      }

      /**
       * ============================================
       * EXTRACT TASK ID
       * ============================================
       */

      const taskId =
        job?.data?.taskId ||
        job?.data?.task_id ||
        job?.taskId ||
        job?.task_id ||
        null;

      if (!taskId) {
        console.error(
          "❌ Suno returned no task ID:",
          job
        );

        return {
          success: false,

          provider:
            "suno",

          error:
            "Suno responded successfully but did not return a task ID.",

          raw:
            job,
        };
      }

      /**
       * ============================================
       * SUCCESS
       * ============================================
       */

      console.log(
        "✅ SUNO TASK CREATED:"
      );

      console.log(
        "🎵 Task ID:",
        taskId
      );

      console.log(
        "🎵 Instrumental:",
        isInstrumental
      );

      return {
        success: true,

        provider:
          "suno",

        taskId,

        status:
          job?.data?.status ||
          "PENDING",

        audioUrl:
          job?.data?.audioUrl ||
          job?.data?.audio_url ||
          null,

        title:
          cleanTitle,

        instrumental:
          isInstrumental,

        raw:
          job,
      };

    } finally {
      clearTimeout(
        timeout
      );
    }

  } catch (error) {
    /**
     * ================================================
     * ERROR HANDLING
     * ================================================
     */

    console.error(
      "❌ Suno generation error:",
      error
    );

    return {
      success: false,

      provider:
        "suno",

      error:
        error?.name ===
        "AbortError"
          ? "Suno request timed out after 30 seconds."
          : error instanceof Error
          ? error.message
          : "Suno music generation failed.",
    };
  }
}