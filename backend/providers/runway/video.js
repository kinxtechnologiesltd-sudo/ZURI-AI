import RunwayML, {
  TaskFailedError,
} from "@runwayml/sdk";

import {
  ENV,
} from "../../config/environment.js";

const client =
  new RunwayML({
    apiKey:
      ENV.RUNWAY_API_KEY,
  });

/**
 * =====================================================
 * RUNWAY VIDEO GENERATION
 * =====================================================
 */

export async function generateRunwayVideo({
  prompt,
  image = null,
  duration = 10,
  ratio = "1280:720",
  seed,
}) {
  try {
    /**
     * Make sure duration is a valid number.
     */

    const safeDuration =
      Number(duration) || 10;

    let task;

    /**
     * ==========================================
     * IMAGE → VIDEO
     * ==========================================
     */

    if (image) {
      task =
        await client.imageToVideo
          .create({
            model:
              "gen4.5",

            promptImage:
              image,

            promptText:
              prompt,

            duration:
              safeDuration,

            ratio,

            ...(seed !== undefined
              ? { seed }
              : {}),
          })
          .waitForTaskOutput();

    /**
     * ==========================================
     * TEXT → VIDEO
     * ==========================================
     */

    } else {
      task =
        await client.textToVideo
          .create({
            model:
              "gen4.5",

            promptText:
              prompt,

            duration:
              safeDuration,

            ratio,

            ...(seed !== undefined
              ? { seed }
              : {}),
          })
          .waitForTaskOutput();
    }

    console.log(
      "🎬 RUNWAY VIDEO COMPLETE:",
      {
        taskId:
          task?.id,

        status:
          task?.status,

        duration:
          safeDuration,

        videoUrl:
          task?.output?.[0] ||
          null,
      }
    );

    return {
      success: true,

      provider:
        "runway",

      taskId:
        task?.id ||
        null,

      status:
        task?.status ||
        "SUCCEEDED",

      duration:
        safeDuration,

      videoUrl:
        task?.output?.[0] ||
        null,

      raw:
        task,
    };

  } catch (error) {
    if (
      error instanceof
      TaskFailedError
    ) {
      console.error(
        "❌ Runway task failed:",
        error.taskDetails
      );

      return {
        success: false,

        provider:
          "runway",

        error:
          "Runway video generation failed.",

        details:
          error.taskDetails,
      };
    }

    console.error(
      "❌ Runway error:",
      error
    );

    return {
      success: false,

      provider:
        "runway",

      error:
        error instanceof Error
          ? error.message
          : "Runway video generation failed.",
    };
  }
}