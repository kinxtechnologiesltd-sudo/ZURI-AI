import express from "express";
import { verifyFirebaseUser } from "../middleware/auth.js";
import { createReportController, getReportController, listReportsController } from "../controllers/reportController.js";

const router = express.Router();
router.post("/", verifyFirebaseUser, createReportController);
router.get("/", verifyFirebaseUser, listReportsController);
router.get("/:reportId", verifyFirebaseUser, getReportController);
export default router;
