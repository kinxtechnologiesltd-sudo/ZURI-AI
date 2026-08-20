import {
  generateSunoMusic,
} from "../providers/suno/music.js";

import {
  getSunoStatus,
} from "../providers/suno/status.js";

/**
 * =====================================================
 * WAIT FOR SUNO COMPLETION
 * =====================================================
 *
 * Used by the video + audio pipeline.
 *
 * Suno first returns a taskId.
 * We then keep checking until Suno returns
 * an actual audioUrl.
 */

export async function waitForMusic(
  taskId,
  {
    intervalMs = 5000,
    maxAttempts = 60,
  } = {}
) {
  if (!taskId) {
    return {
      success: false,
      provider: "suno",
      taskId: null,
      status: "ERROR",
      audioUrl: null,
      title: null,
      error:
        "Suno taskId is required.",
    };
  }

  console.log(
    "🎵 Waiting for Suno completion:",
    taskId
  );

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    try {
      console.log(
        `🎵 Backend Suno check (${attempt}/${maxAttempts})`
      );

      const status =
        await getSunoStatus(
          taskId
        );

      console.log(
        "🎵 BACKEND SUNO STATUS:"
      );

      console.dir(
        status,
        {
          depth: null,
        }
      );

      /**
       * =========================================
       * AUDIO IS READY
       * =========================================
       */

      if (
        status?.audioUrl
      ) {
        console.log(
          "✅ SUNO AUDIO READY:",
          status.audioUrl
        );

        return {
          success: true,
          provider: "suno",
          taskId,

          status:
            status.status ||
            "SUCCESS",

          audioUrl:
            status.audioUrl,

          title:
            status.title ||
            null,

          raw:
            status.raw ||
            null,
        };
      }

      /**
       * =========================================
       * CHECK FAILED STATES
       * =========================================
       */

      const state =
        String(
          status?.status ||
          ""
        ).toUpperCase();

      if (
        state === "FAILED" ||
        state === "ERROR" ||
        state === "CANCELLED"
      ) {
        console.error(
          "❌ Suno generation failed:",
          status
        );

        return {
          success: false,
          provider: "suno",
          taskId,

          status:
            status.status ||
            "FAILED",

          audioUrl: null,

          title:
            status.title ||
            null,

          error:
            status.error ||
            "Suno music generation failed.",

          raw:
            status.raw ||
            null,
        };
      }

      /**
       * =========================================
       * NO DATA
       * =========================================
       *
       * This can happen temporarily.
       * Keep polling instead of immediately failing.
       */

      if (
        state === "NO_DATA"
      ) {
        console.log(
          "⚠️ Suno returned NO_DATA. Retrying..."
        );
      }

    } catch (error) {
      /**
       * A temporary network/API error should not
       * immediately destroy the generation.
       */

      console.error(
        "⚠️ Suno status check failed:",
        error
      );
    }

    /**
     * =========================================
     * WAIT BEFORE NEXT CHECK
     * =========================================
     */

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

  /**
   * =========================================
   * TIMEOUT
   * =========================================
   */

  console.error(
    "⏰ Suno backend polling timed out:",
    taskId
  );

  return {
    success: false,

    provider: "suno",

    taskId,

    status:
      "TIMEOUT",

    audioUrl: null,

    title: null,

    error:
      "Suno generation timed out before an audio URL was available.",
  };
}

/**
 * =====================================================
 * GENERATE MUSIC
 * =====================================================
 *
 * Normal music requests:
 *
 *   waitForCompletion = false
 *
 * Start Suno and immediately return taskId.
 *
 * Video + audio pipeline:
 *
 *   waitForCompletion = true
 *
 * Start Suno, wait for completion, then return
 * the actual audioUrl.
 */

export async function generateMusic({
  prompt,
  style = "",
  instrumental = false,
  title = "Zuri Creation",
  waitForCompletion = false,
}) {
  console.log(
    "🎵 Music provider: Suno"
  );

  console.log(
    "🎵 Music prompt:",
    prompt
  );

  /**
   * =========================================
   * START SUNO
   * =========================================
   */

  const generation =
    await generateSunoMusic({
      prompt,
      style,
      instrumental,
      title,
    });

  console.log(
    "🎵 SUNO GENERATION START RESULT:"
  );

  console.dir(
    generation,
    {
      depth: null,
    }
  );

  /**
   * =========================================
   * IMMEDIATE FAILURE
   * =========================================
   */

  if (
    !generation?.success ||
    !generation?.taskId
  ) {
    return {
      success: false,

      provider:
        generation?.provider ||
        "suno",

      taskId:
        generation?.taskId ||
        null,

      status:
        generation?.status ||
        "ERROR",

      audioUrl:
        generation?.audioUrl ||
        null,

      title:
        generation?.title ||
        null,

      error:
        generation?.error ||
        "Suno could not start music generation.",

      raw:
        generation?.raw ||
        null,
    };
  }

  const taskId =
    generation.taskId;

  console.log(
    "🎵 Suno task created:",
    taskId
  );

  /**
   * =========================================
   * NORMAL MUSIC CHAT
   * =========================================
   *
   * Don't block regular music requests.
   */

  if (
    !waitForCompletion
  ) {
    return {
      ...generation,

      success: true,

      provider:
        generation.provider ||
        "suno",

      taskId,

      status:
        "PENDING",

      audioUrl:
        generation.audioUrl ||
        null,

      message:
        "Music generation started. The Suno task is being processed.",
    };
  }

  /**
   * =========================================
   * VIDEO + AUDIO MODE
   * =========================================
   *
   * THIS is what videoWithAudio.js uses.
   */

  console.log(
    "🎬 Video pipeline requires completed Suno audio."
  );

  const completed =
    await waitForMusic(
      taskId,
      {
        intervalMs: 5000,
        maxAttempts: 60,
      }
    );

  /**
   * =========================================
   * SUNO FAILED / TIMED OUT
   * =========================================
   */

  if (
    !completed?.success ||
    !completed?.audioUrl
  ) {
    console.error(
      "❌ Suno did not return completed audio:",
      completed
    );

    return {
      success: false,

      provider: "suno",

      taskId,

      status:
        completed?.status ||
        "FAILED",

      audioUrl: null,

      title:
        completed?.title ||
        null,

      error:
        completed?.error ||
        "Suno did not return a completed audio URL.",

      raw:
        completed?.raw ||
        null,
    };
  }

  /**
   * =========================================
   * SUCCESS
   * =========================================
   */

  console.log(
    "✅ COMPLETED SUNO MUSIC:"
  );

  console.log(
    completed.audioUrl
  );

  return {
    ...generation,

    ...completed,

    success: true,

    provider: "suno",

    taskId,

    status:
      completed.status ||
      "SUCCESS",

    audioUrl:
      completed.audioUrl,

    title:
      completed.title ||
      null,

    message:
      "Music generation completed.",
  };
}

/**
 * =====================================================
 * GET MUSIC STATUS
 * =====================================================
 *
 * Used by normal frontend polling.
 */

export async function getMusicStatus(
  taskId
) {
  return await getSunoStatus(
    taskId
  );
}