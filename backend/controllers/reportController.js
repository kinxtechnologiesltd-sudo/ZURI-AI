import { adminDb } from "../config/firebase.js";
import { verifyFirebaseUser } from "../middleware/auth.js";
import { checkReportRateLimit, createReport, getReport, listReports, validateReportPayload } from "../services/report/createReport.js";

function isModerator(req) {
  if (req.user?.moderator === true || req.user?.admin === true) return true;
  const emails = String(process.env.MODERATION_EMAILS || "").split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
  if (req.user?.email && emails.includes(String(req.user.email).toLowerCase())) return true;
  const key = req.get("x-report-admin-key");
  if (key && process.env.REPORT_ADMIN_KEY && key === process.env.REPORT_ADMIN_KEY) return true;
  return false;
}

export async function createReportController(req, res) {
  try {
    const userId = req.user.uid;
    const rateLimit = checkReportRateLimit(userId);
    if (!rateLimit.allowed) return res.status(429).json({ success: false, error: "Too many reports submitted. Please try again later.", retryAfterMs: rateLimit.retryAfterMs });
    const validation = validateReportPayload(req.body);
    if (!validation.ok) return res.status(400).json({ success: false, errors: validation.errors });
    const result = await createReport(adminDb, { userId, reporterEmail: req.user.email || null, ...validation.value, clientPlatform: req.get("x-client-platform") || null });
    return res.status(201).json({ success: true, reportId: result.reportId });
  } catch (error) { console.error("Report creation error:", error); return res.status(500).json({ success: false, error: "Unable to submit report." }); }
}

export async function listReportsController(req, res) {
  try { if (!isModerator(req)) return res.status(403).json({ success: false, error: "Forbidden." }); const reports = await listReports(adminDb, { limit: req.query.limit }); return res.status(200).json({ success: true, reports }); } catch (error) { console.error("Report list error:", error); return res.status(500).json({ success: false, error: "Unable to retrieve reports." }); }
}

export async function getReportController(req, res) {
  try { if (!isModerator(req)) return res.status(403).json({ success: false, error: "Forbidden." }); const report = await getReport(adminDb, req.params.reportId); if (!report) return res.status(404).json({ success: false, error: "Report not found." }); return res.status(200).json({ success: true, report }); } catch (error) { console.error("Report get error:", error); return res.status(500).json({ success: false, error: "Unable to retrieve report." }); }
}
