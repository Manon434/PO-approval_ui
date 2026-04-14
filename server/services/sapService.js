import axios from "axios";
import { env, hasSapCredentials } from "../config/env.js";

function assertSapCredentials() {
  if (!hasSapCredentials()) {
    throw new Error("SAP credentials are not configured. Set SAP_USER and SAP_PASS in .env.");
  }
}

function buildSapAuthConfig(overrides = {}) {
  return {
    auth: {
      username: env.sapUser,
      password: env.sapPass
    },
    timeout: 20000,
    ...overrides
  };
}

function normalizeSapResponsePayload(payload) {
  if (typeof payload !== "string") {
    return payload;
  }

  const trimmed = payload.trim();

  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    return JSON.parse(trimmed);
  }

  throw new Error("SAP response could not be parsed as JSON.");
}

function formatSapDatePart(date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Calcutta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return formatter.format(date);
}

function formatSapTimePart(date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Calcutta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });

  return formatter.format(date);
}

export async function fetchPendingPurchaseOrders(frgco) {
  assertSapCredentials();

  const response = await axios.get(
    env.sapPendingUrl,
    buildSapAuthConfig({
      params: {
        "sap-client": env.sapClient,
        FRGCO: frgco
      },
      responseType: "text"
    })
  );

  return normalizeSapResponsePayload(response.data);
}

export async function fetchFinalPurchaseOrders() {
  assertSapCredentials();

  const response = await axios.get(
    env.sapFinalUrl,
    buildSapAuthConfig({
      params: {
        "sap-client": env.sapClient
      },
      responseType: "text"
    })
  );

  return normalizeSapResponsePayload(response.data);
}

export async function postPurchaseOrderDecision({ poNumber, frgco, action, remark }) {
  assertSapCredentials();

  const now = new Date();
  const statusCode = action === "approve" ? "A" : "R";

  const response = await axios.post(
    env.sapApprovalUrl,
    {
      MANDT: env.sapMandt,
      EBELN: poNumber,
      FRGCO: frgco,
      ZDATE: formatSapDatePart(now),
      ZTIME: formatSapTimePart(now),
      STATUS: statusCode,
      REMARK: remark ?? ""
    },
    buildSapAuthConfig({
      params: {
        "sap-client": env.sapClient
      },
      headers: {
        "Content-Type": "application/json"
      }
    })
  );

  return {
    statusCode,
    submittedAt: now.toISOString(),
    data: response.data
  };
}
