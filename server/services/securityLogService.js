import crypto from "crypto";
import { countRecentLogs, createSecurityLog, listRecentLogs } from "../repositories/securityLogRepository.js";

function hashSessionId(sessionId) {
  if (!sessionId) {
    return undefined;
  }

  return crypto.createHash("sha256").update(sessionId).digest("hex").slice(0, 16);
}

function buildDeviceLabel(userAgent = "") {
  if (!userAgent) {
    return "Unknown device";
  }

  const source = userAgent.toLowerCase();
  const platform = source.includes("windows")
    ? "Windows"
    : source.includes("mac os")
      ? "macOS"
      : source.includes("android")
        ? "Android"
        : source.includes("iphone") || source.includes("ipad")
          ? "iOS"
          : source.includes("linux")
            ? "Linux"
            : "Unknown OS";
  const browser = source.includes("edg/")
    ? "Edge"
    : source.includes("chrome/")
      ? "Chrome"
      : source.includes("firefox/")
        ? "Firefox"
        : source.includes("safari/")
          ? "Safari"
          : "Browser";

  return `${platform} / ${browser}`;
}

export async function logSecurityEvent(entry) {
  const normalizedEntry = {
    severity: entry.severity ?? "info",
    ...entry,
    sessionId: hashSessionId(entry.sessionId),
    deviceLabel: entry.deviceLabel ?? buildDeviceLabel(entry.userAgent)
  };

  await createSecurityLog(normalizedEntry);
  await detectSuspiciousActivity(normalizedEntry);
}

async function detectSuspiciousActivity(entry) {
  if (entry.type === "login_failed" && entry.ip) {
    const failedCount = await countRecentLogs(
      {
        type: "login_failed",
        ip: entry.ip
      },
      15 * 60 * 1000
    );

    if (failedCount >= 5) {
      await createSecurityLog({
        type: "suspicious_activity",
        severity: "high",
        ip: entry.ip,
        userAgent: entry.userAgent,
        deviceLabel: entry.deviceLabel,
        message: "Multiple failed login attempts detected from the same IP within 15 minutes.",
        meta: {
          failedLogins: failedCount
        }
      });
    }
  }

  if (entry.type === "login_succeeded" && entry.userId) {
    const recentSuccessfulLogins = await listRecentLogs(
      {
        type: "login_succeeded",
        userId: entry.userId
      },
      24 * 60 * 60 * 1000
    );

    const uniqueIps = new Set(recentSuccessfulLogins.map((log) => log.ip).filter(Boolean));
    const uniqueDevices = new Set(recentSuccessfulLogins.map((log) => log.deviceLabel).filter(Boolean));

    if (uniqueIps.size >= 3 || uniqueDevices.size >= 3) {
      await createSecurityLog({
        type: "suspicious_activity",
        severity: "medium",
        userId: entry.userId,
        email: entry.email,
        ip: entry.ip,
        userAgent: entry.userAgent,
        deviceLabel: entry.deviceLabel,
        message: "Multiple IP addresses or devices detected for the same account within 24 hours.",
        meta: {
          uniqueIps: uniqueIps.size,
          uniqueDevices: uniqueDevices.size
        }
      });
    }
  }
}

export function getRequestIp(request) {
  return (
    request.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    request.socket?.remoteAddress ||
    request.ip ||
    "unknown"
  );
}

export function getDeviceLabelFromRequest(request) {
  return buildDeviceLabel(request.headers["user-agent"] ?? "");
}
