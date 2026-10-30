import crypto from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";

export const REPORT_CONTENT_TYPES = [
  "text",
  "image",
  "comic",
  "video",
  "music",
];

export const REPORT_REASONS = [
  "hate",
  "sexual",
  "violence",
  "harassment",
  "self_harm",
  "misinformation",
  "other",
];

const reportWindows = new Map();

export function validateReportPayload(body = {}) {
  const errors = [];

  const contentType = String(body.contentType || "")
    .trim()
    .toLowerCase();

  if (!REPORT_CONTENT_TYPES.includes(contentType)) {
    errors.push(
      `contentType must be one of: ${REPORT_CONTENT_TYPES.join(", ")}`
    );
  }

  const reason = String(body.reason || "")
    .trim()
    .toLowerCase();

  if (!REPORT_REASONS.includes(reason)) {
    errors.push(
      `reason must be one of: ${REPORT_REASONS.join(", ")}`
    );
  }

  const contentId =
    body.contentId == null
      ? null
      : String(body.contentId).trim() || null;

  const messageId =
    body.messageId == null
      ? null
      : String(body.messageId).trim() || null;

  const conversationId =
    body.conversationId == null
      ? null
      : String(body.conversationId).trim() || null;

  const contentUrl =
    body.contentUrl == null
      ? null
      : String(body.contentUrl).trim() || null;

  const contentSnippet =
    body.contentSnippet == null
      ? null
      : String(body.contentSnippet).trim().slice(0, 500) || null;

  const details =
    body.details == null
      ? null
      : String(body.details).trim().slice(0, 2000) || null;

  if (
    contentUrl &&
    !/^https?:\/\//i.test(contentUrl)
  ) {
    errors.push("contentUrl must use http or https.");
  }

  if (
    !contentId &&
    !messageId &&
    !conversationId &&
    !contentUrl &&
    !contentSnippet
  ) {
    errors.push(
      "At least one content reference is required."
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    value: {
      contentType,
      reason,
      contentId,
      messageId,
      conversationId,
      contentUrl,
      contentSnippet,
      details,
    },
  };
}

export function checkReportRateLimit(
  userId,
  now = Date.now(),
  maxReports = 10,
  windowMs = 10 * 60 * 1000
) {
  const recent = (reportWindows.get(userId) || []).filter(
    (timestamp) => now - timestamp < windowMs
  );

  if (recent.length >= maxReports) {
    const oldest = recent[0];
    return {
      allowed: false,
      retryAfterMs: Math.max(
        0,
        windowMs - (now - oldest)
      ),
    };
  }

  recent.push(now);
  reportWindows.set(userId, recent);

  return {
    allowed: true,
    retryAfterMs: 0,
  };
}

export function resetReportRateLimits() {
  reportWindows.clear();
}

export async function createReport(db, report) {
  const reportId =
    report.id || crypto.randomUUID();

  const document = {
    id: reportId,
    userId: report.userId,
    reporterEmail: report.reporterEmail || null,
    contentType: report.contentType,
    reason: report.reason,
    contentId: report.contentId || null,
    messageId: report.messageId || null,
    conversationId: report.conversationId || null,
    contentUrl: report.contentUrl || null,
    contentSnippet: report.contentSnippet || null,
    details: report.details || null,
    status: report.status || "pending",
    source: report.source || "zuri-app",
    clientPlatform: report.clientPlatform || null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await db
    .collection("reports")
    .doc(reportId)
    .set(document);

  return {
    success: true,
    reportId,
  };
}

export async function listReports(db, options = {}) {
  const limit = Math.min(
    Math.max(Number(options.limit) || 50, 1),
    200
  );

  const snapshot = await db
    .collection("reports")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getReport(db, reportId) {
  const snapshot = await db
    .collection("reports")
    .doc(reportId)
    .get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}
