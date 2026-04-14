import express from "express";
import rateLimit from "express-rate-limit";
import { isDatabaseReady } from "../config/db.js";
import { env, hasSapCredentials } from "../config/env.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import {
  findPurchaseOrder,
  listPurchaseOrderStatuses,
  listPurchaseOrders,
  updatePurchaseOrderDecision
} from "../repositories/purchaseOrderRepository.js";
import { postPurchaseOrderDecision } from "../services/sapService.js";
import { syncPurchaseOrders } from "../services/syncPurchaseOrders.js";
import { getSyncState } from "../services/syncState.js";

const router = express.Router();
const defaultFrgco = env.sapFrgcoCodes[0] ?? "D1";

const decisionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many sensitive actions. Please slow down and try again shortly."
  }
});

router.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "po-approval-backend",
    timestamp: new Date().toISOString(),
    database: {
      connected: isDatabaseReady()
    },
    sap: {
      configured: hasSapCredentials(),
      sync: getSyncState(),
      pendingUrl: env.sapPendingUrl,
      finalUrl: env.sapFinalUrl,
      approvalUrl: env.sapApprovalUrl
    }
  });
});

router.get("/po", requireAuth, async (request, response) => {
  try {
    const status = request.query.status ? String(request.query.status) : undefined;
    const orders = await listPurchaseOrders({ status });
    response.json(orders);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.get("/po/:poNumber", requireAuth, async (request, response) => {
  try {
    const order = await findPurchaseOrder(request.params.poNumber);

    if (!order) {
      response.status(404).json({ error: "Purchase order not found." });
      return;
    }

    response.json(order);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

function normalizeDecisionRemark(action, body) {
  const explicitRemark = String(body.remark ?? "").trim();

  if (explicitRemark) {
    return explicitRemark;
  }

  const comments = String(body.comments ?? "").trim();
  const reason = String(body.reason ?? "").trim();

  if (action === "reject") {
    if (reason && comments) {
      return `${reason}: ${comments}`;
    }

    return reason || comments;
  }

  return comments;
}

function buildDecisionHistoryEntry({ poNumber, action, requestUser, submittedAt, remark, reason }) {
  const title = action === "approve" ? "Approved" : "Rejected";

  return {
    id: `${poNumber}-${action}-${Date.parse(submittedAt)}`,
    type: action === "approve" ? "approved" : "rejected",
    title,
    actor: requestUser.name,
    role: requestUser.role,
    time: submittedAt,
    note: remark,
    reason: action === "reject" ? reason : undefined
  };
}

async function submitDecision({ poNumber, action, requestUser, remark, reason }) {
  const existingOrder = await findPurchaseOrder(poNumber);

  if (!existingOrder) {
    return {
      statusCode: 404,
      payload: { error: "Purchase order not found." }
    };
  }

  if (!remark) {
    return {
      statusCode: 400,
      payload: {
        error: action === "approve" ? "Director comments are required." : "Rejection reason and director comments are required."
      }
    };
  }

  const effectiveFrgco = existingOrder.frgco || defaultFrgco;
  const sapResult = await postPurchaseOrderDecision({
    poNumber,
    frgco: effectiveFrgco,
    action,
    remark
  });

  const status = action === "approve" ? "Approved" : "Rejected";
  const submittedAt = sapResult.submittedAt;
  const updatedOrder = await updatePurchaseOrderDecision(poNumber, {
    ...existingOrder,
    frgco: effectiveFrgco,
    status,
    sapStatusCode: sapResult.statusCode,
    remark,
    approvedBy: effectiveFrgco,
    approvedAt: submittedAt,
    decisionSubmittedAt: submittedAt,
    syncState: "awaiting_confirmation",
    statusSource: "local",
    approvalHistory: [
      ...(existingOrder.approvalHistory ?? []),
      buildDecisionHistoryEntry({
        poNumber,
        action,
        requestUser,
        submittedAt,
        remark,
        reason
      })
    ],
    syncInfo: {
      ...(existingOrder.syncInfo ?? {}),
      lastDecisionSubmittedAt: submittedAt,
      awaitingSapConfirmation: true
    }
  });

  return {
    statusCode: 200,
    payload: updatedOrder
  };
}

router.get("/po-status", requireAuth, async (_request, response) => {
  try {
    const statuses = await listPurchaseOrderStatuses();
    response.json(statuses);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.post("/approve", requireAuth, requireRole("Director"), decisionLimiter, async (request, response) => {
  try {
    const poNumber = String(request.body.poNumber ?? "").trim();
    const action = String(request.body.action ?? "").trim().toLowerCase();
    const remark = normalizeDecisionRemark(action, request.body);
    const reason = String(request.body.reason ?? "").trim();

    if (!poNumber || !["approve", "reject"].includes(action)) {
      response.status(400).json({ error: "Provide a valid poNumber and action." });
      return;
    }

    const result = await submitDecision({
      poNumber,
      action,
      requestUser: request.user,
      remark,
      reason
    });

    response.status(result.statusCode).json(result.payload);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.post("/po/:poNumber/approve", requireAuth, requireRole("Director"), decisionLimiter, async (request, response) => {
  try {
    const result = await submitDecision({
      poNumber: request.params.poNumber,
      action: "approve",
      requestUser: request.user,
      remark: normalizeDecisionRemark("approve", request.body),
      reason: ""
    });

    response.status(result.statusCode).json(result.payload);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.post("/po/:poNumber/reject", requireAuth, requireRole("Director"), decisionLimiter, async (request, response) => {
  try {
    const reason = String(request.body.reason ?? "").trim();
    const result = await submitDecision({
      poNumber: request.params.poNumber,
      action: "reject",
      requestUser: request.user,
      remark: normalizeDecisionRemark("reject", request.body),
      reason
    });

    response.status(result.statusCode).json(result.payload);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.post("/admin/sync", requireAuth, requireRole("Director"), decisionLimiter, async (_request, response) => {
  try {
    const summary = await syncPurchaseOrders();
    response.json({
      message: "SAP sync completed.",
      summary
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

export default router;
