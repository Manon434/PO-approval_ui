import { authCookieNames, restoreSessionFromRefreshToken, verifyAccessToken } from "../services/authService.js";
import { getDeviceLabelFromRequest, getRequestIp, logSecurityEvent } from "../services/securityLogService.js";

function extractBearerToken(request) {
  const authHeader = request.headers.authorization ?? "";

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

function normalizeUser(payload) {
  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    name: payload.name,
    sessionId: payload.sid
  };
}

export async function attachAuthContext(request, response, next) {
  const token = request.cookies?.[authCookieNames.access] ?? extractBearerToken(request);

  if (token) {
    try {
      request.user = normalizeUser(verifyAccessToken(token));
      next();
      return;
    } catch {
      // Fall through to refresh-based restoration.
    }
  }

  const restoredUser = await restoreSessionFromRefreshToken(request.cookies?.[authCookieNames.refresh], response);

  if (restoredUser) {
    request.user = restoredUser;
  }

  next();
}

export async function requireAuth(request, response, next) {
  if (!request.user) {
    await logSecurityEvent({
      type: "unauthorized_request",
      severity: "medium",
      ip: getRequestIp(request),
      userAgent: request.headers["user-agent"],
      deviceLabel: getDeviceLabelFromRequest(request),
      method: request.method,
      path: request.originalUrl,
      statusCode: 401,
      success: false,
      message: "Request rejected because no valid session was present."
    });
    response.status(401).json({ error: "Authentication required." });
    return;
  }

  next();
}

export function requireRole(role) {
  return async (request, response, next) => {
    if (!request.user || request.user.role !== role) {
      await logSecurityEvent({
        type: "forbidden_request",
        severity: "high",
        userId: request.user?.id,
        email: request.user?.email,
        ip: getRequestIp(request),
        userAgent: request.headers["user-agent"],
        deviceLabel: getDeviceLabelFromRequest(request),
        method: request.method,
        path: request.originalUrl,
        statusCode: 403,
        success: false,
        sessionId: request.user?.sessionId,
        message: `Request rejected because the user lacks the required ${role} role.`
      });
      response.status(403).json({ error: "You do not have permission to perform this action." });
      return;
    }

    next();
  };
}
