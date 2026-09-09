import express from "express";
import { getSunoStatus } from "../providers/suno/status.js";

const router = express.Router();

/**
 * =====================================================
 * TEMPORARY DEVELOPMENT STORAGE
 * =====================================================
 */

const sunoJobs = new Map();

/**
 * =====================================================
 * GET CALLBACK TEST
 * =====================================================
 */

router.get(
  "/callback",
  (req, res) => {
    return res.status(200).json({
      success: true,
      message:
        "Suno callback endpoint is reachable.",
    });
  }
);

/**
 * =====================================================
 * SUNO CALLBACK
 * =====================================================
 */

router.post(
  "/callback",
  express.json(),
  async (req, res) => {
    try {
      console.log(
        "🎵 SUNO CALLBACK RECEIVED"
      );

      console.dir(
        req.body,
        { depth: null }
      );

      const body =
        req.body || {};

      const taskId =
        body?.data?.task_id ||
        body?.data?.taskId ||
        body?.task_id ||
        body?.taskId ||
        null;

      const status =
        body?.data?.status ||
        body?.status ||
        body?.data?.callbackType ||
        body?.callbackType ||
        "UNKNOWN";

      const tracks =
        body?.data?.data ||
        body?.data?.response?.sunoData ||
        body?.data?.response?.data ||
        body?.data?.sunoData ||
        [];

      const trackList =
        Array.isArray(tracks)
          ? tracks
          : [];

      const firstTrack =
        trackList[0] || null;

      const audioUrl =
        firstTrack?.audio_url ||
        firstTrack?.audioUrl ||
        firstTrack?.source_audio_url ||
        firstTrack?.sourceAudioUrl ||
        firstTrack?.stream_audio_url ||
        firstTrack?.streamAudioUrl ||
        body?.data?.audio_url ||
        body?.data?.audioUrl ||
        null;

      const title =
        firstTrack?.title ||
        body?.data?.title ||
        body?.title ||
        null;

      if (taskId) {
        const previous =
          sunoJobs.get(taskId) ||
          {};

        const job = {
          ...previous,
          taskId,
          status,
          audioUrl:
            audioUrl ||
            previous.audioUrl ||
            null,
          title:
            title ||
            previous.title ||
            null,
          raw: body,
          updatedAt:
            Date.now(),
        };

        sunoJobs.set(
          taskId,
          job
        );

        console.log(
          "🎵 SUNO JOB STORED:"
        );

        console.dir(
          job,
          { depth: null }
        );
      } else {
        console.warn(
          "⚠️ Suno callback did not contain a task ID."
        );
      }

      return res.status(200).json({
        success: true,
      });

    } catch (error) {
      console.error(
        "❌ Suno callback error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Suno callback failed.",
      });
    }
  }
);

/**
 * =====================================================
 * SUNO STATUS
 * =====================================================
 */

router.get(
  "/status/:taskId",
  async (req, res) => {
    const taskId =
      req.params.taskId;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        provider: "suno",
        error:
          "Suno taskId is required.",
      });
    }

    try {
      /**
       * Check callback cache first
       */
      const cachedJob =
        sunoJobs.get(taskId);

      if (
        cachedJob?.audioUrl
      ) {
        console.log(
          "✅ Returning cached Suno audio:"
        );

        console.log(
          cachedJob.audioUrl
        );

        return res.status(200).json({
          success: true,
          provider: "suno",
          taskId,
          status:
            cachedJob.status ||
            "SUCCESS",
          audioUrl:
            cachedJob.audioUrl,
          title:
            cachedJob.title ||
            null,
          source:
            "callback-cache",
          raw:
            cachedJob.raw ||
            null,
        });
      }

      /**
       * Ask Suno directly
       */
      console.log(
        "🎵 Checking Suno directly:",
        taskId
      );

      const live =
        await getSunoStatus(
          taskId
        );

      console.log(
        "🎵 LIVE SUNO STATUS:"
      );

      console.dir(
        live,
        { depth: null }
      );

      if (live?.success) {
        const previous =
          sunoJobs.get(taskId) ||
          {};

        const mergedJob = {
          ...previous,
          taskId,
          status:
            live.status ||
            previous.status ||
            "UNKNOWN",
          audioUrl:
            live.audioUrl ||
            previous.audioUrl ||
            null,
          title:
            live.title ||
            previous.title ||
            null,
          raw:
            live.raw ||
            previous.raw ||
            null,
          updatedAt:
            Date.now(),
        };

        sunoJobs.set(
          taskId,
          mergedJob
        );

        if (
          mergedJob.audioUrl
        ) {
          console.log(
            "✅ SUNO AUDIO READY:",
            mergedJob.audioUrl
          );

          return res.status(200).json({
            success: true,
            provider: "suno",
            taskId,
            status:
              mergedJob.status ||
              "SUCCESS",
            audioUrl:
              mergedJob.audioUrl,
            title:
              mergedJob.title ||
              null,
            source:
              "suno-api",
            raw:
              mergedJob.raw ||
              null,
          });
        }

        return res.status(200).json({
          success: true,
          provider: "suno",
          taskId,
          status:
            mergedJob.status ||
            "PENDING",
          audioUrl: null,
          title:
            mergedJob.title ||
            null,
          source:
            "suno-api",
          raw:
            mergedJob.raw ||
            null,
        });
      }

      return res.status(200).json({
        success: false,
        provider: "suno",
        taskId,
        status:
          live?.status ||
          "ERROR",
        audioUrl: null,
        error:
          live?.error ||
          "Unable to retrieve Suno status.",
        raw:
          live?.raw ||
          null,
      });

    } catch (error) {
      console.error(
        "❌ Suno status route error:",
        error
      );

      return res.status(500).json({
        success: false,
        provider: "suno",
        taskId,
        status: "ERROR",
        audioUrl: null,
        error:
          error instanceof Error
            ? error.message
            : "Unable to retrieve Suno status.",
      });
    }
  }
);

/**
 * =====================================================
 * DOWNLOAD GENERATED MUSIC
 * =====================================================
 *
 * GET /suno/download?url=<audio-url>
 */

router.get(
  "/download",
  async (req, res) => {
    try {
      const audioUrl =
        req.query.url;

      if (
        typeof audioUrl !== "string" ||
        !audioUrl
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Audio URL is required.",
        });
      }

      const parsedUrl =
        new URL(audioUrl);

      const hostname =
        parsedUrl.hostname
          .toLowerCase();

      const allowedHost =
        hostname === "sunoapi.org" ||
        hostname.endsWith(
          ".sunoapi.org"
        ) ||
        hostname === "suno.ai" ||
        hostname.endsWith(
          ".suno.ai"
        );

      if (!allowedHost) {
        return res.status(403).json({
          success: false,
          error:
            "Audio host is not allowed.",
        });
      }

      console.log(
        "⬇️ Downloading Suno audio:"
      );

      console.log(
        audioUrl
      );

      const response =
        await fetch(audioUrl);

      if (!response.ok) {
        return res.status(
          response.status
        ).json({
          success: false,
          error:
            "Unable to download the generated music.",
        });
      }

      const contentType =
        response.headers.get(
          "content-type"
        ) ||
        "audio/mpeg";

      const buffer =
        Buffer.from(
          await response.arrayBuffer()
        );

      res.setHeader(
        "Content-Type",
        contentType
      );

      res.setHeader(
        "Content-Length",
        buffer.length
      );

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="zuri-music.mp3"'
      );

      return res.send(
        buffer
      );

    } catch (error) {
      console.error(
        "❌ Music download error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Music download failed.",
      });
    }
  }
);

/**
 * =====================================================
 * DEBUG
 * =====================================================
 */

router.get(
  "/debug/:taskId",
  (req, res) => {
    const taskId =
      req.params.taskId;

    const job =
      sunoJobs.get(taskId);

    return res.status(200).json({
      success: true,
      exists: !!job,
      taskId,
      job: job || null,
    });
  }
);

export default router;