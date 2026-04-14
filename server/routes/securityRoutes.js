import express from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { listRecentLogs } from "../repositories/securityLogRepository.js";

const router = express.Router();

router.get("/events", requireAuth, requireRole("Director"), async (_request, response) => {
  try {
    const logs = await listRecentLogs({}, 7 * 24 * 60 * 60 * 1000);
    response.json(logs);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.get("/suspicious", requireAuth, requireRole("Director"), async (_request, response) => {
  try {
    const suspiciousLogs = await listRecentLogs({ type: "suspicious_activity" }, 30 * 24 * 60 * 60 * 1000);
    response.json(suspiciousLogs);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

export default router;
