import { ENV } from "../../config/environment.js";

const BASE_URL =
  "https://api.sunoapi.org";

export async function generateSunoMusic({
  prompt,
}) {
  try {
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

    const cleanPrompt =
      String(prompt || "")
        .trim()
        .slice(0, 400);

    if (!cleanPrompt) {
      throw new Error(
        "Suno prompt is empty."
      );
    }

    const requestBody = {
      prompt: cleanPrompt,
      customMode: false,
      instrumental: false,
      model: "V4_5",
      callBackUrl:
        ENV.SUNO_CALLBACK_URL,
    };

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

    const controller =
      new AbortController();

    const timeout =
      setTimeout(() => {
        controller.abort();
      }, 30000);

    try {
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

      if (!response.ok) {
        return {
          success: false,
          provider: "suno",
          error:
            job?.msg ||
            job?.message ||
            "Suno music generation failed.",
          raw: job,
        };
      }

      if (
        job?.code !== undefined &&
        job.code !== 200
      ) {
        return {
          success: false,
          provider: "suno",
          error:
            job?.msg ||
            "Suno rejected the request.",
          raw: job,
        };
      }

      const taskId =
        job?.data?.taskId ||
        job?.data?.task_id ||
        job?.taskId ||
        job?.task_id ||
        null;

      if (!taskId) {
        return {
          success: false,
          provider: "suno",
          error:
            "Suno responded successfully but did not return a task ID.",
          raw: job,
        };
      }

      return {
        success: true,
        provider: "suno",
        taskId,
        status:
          job?.data?.status ||
          "PENDING",
        raw: job,
      };

    } finally {
      clearTimeout(timeout);
    }

  } catch (error) {
    console.error(
      "Suno generation error:",
      error
    );

    return {
      success: false,
      provider: "suno",

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