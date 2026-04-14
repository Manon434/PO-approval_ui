import { getDeviceLabelFromRequest, getRequestIp, logSecurityEvent } from "../services/securityLogService.js";

export function auditRequests() {
  return (request, response, next) => {
    response.on("finish", async () => {
      try {
        await logSecurityEvent({
          type: "request_audit",
          severity: response.statusCode >= 400 ? "medium" : "info",
          userId: request.user?.id,
          email: request.user?.email,
          ip: getRequestIp(request),
          userAgent: request.headers["user-agent"],
          deviceLabel: getDeviceLabelFromRequest(request),
          method: request.method,
          path: request.originalUrl,
          statusCode: response.statusCode,
          success: response.statusCode < 400,
          sessionId: request.user?.sessionId,
          message: `${request.method} ${request.originalUrl} completed with status ${response.statusCode}.`
        });
      } catch (error) {
        console.error("[audit]", error.message);
      }
    });

    next();
  };
}
