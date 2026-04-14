import express from "express";
import rateLimit from "express-rate-limit";
import {
  clearSessionCookies,
  issueSessionCookies,
  revokeSessionFromRequest,
  verifyLoginCredentials
} from "../services/authService.js";
import { getDeviceLabelFromRequest, getRequestIp, logSecurityEvent } from "../services/securityLogService.js";
import { attachAuthContext, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts. Please try again later."
  }
});

router.post("/login", loginLimiter, async (request, response) => {
  const email = String(request.body.email ?? "").trim().toLowerCase();
  const password = String(request.body.password ?? "");
  const ip = getRequestIp(request);
  const userAgent = request.headers["user-agent"];
  const deviceLabel = getDeviceLabelFromRequest(request);

  try {
    const user = await verifyLoginCredentials(email, password);

    if (!user) {
      await logSecurityEvent({
        type: "login_failed",
        severity: "medium",
        email,
        ip,
        userAgent,
        deviceLabel,
        method: request.method,
        path: request.originalUrl,
        statusCode: 401,
        success: false,
        message: "Login failed because the supplied credentials were invalid."
      });
      response.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const session = await issueSessionCookies(response, user, {
      ip,
      userAgent,
      deviceLabel
    });

    await logSecurityEvent({
      type: "login_succeeded",
      severity: "info",
      userId: session.user.id,
      email: session.user.email,
      ip,
      userAgent,
      deviceLabel,
      method: request.method,
      path: request.originalUrl,
      statusCode: 200,
      success: true,
      sessionId: session.sessionId,
      message: "User logged in successfully."
    });

    response.json({
      user: session.user
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.post("/logout", attachAuthContext, async (request, response) => {
  try {
    await revokeSessionFromRequest(request, response);
    await logSecurityEvent({
      type: "logout",
      severity: "info",
      userId: request.user?.id,
      email: request.user?.email,
      ip: getRequestIp(request),
      userAgent: request.headers["user-agent"],
      deviceLabel: getDeviceLabelFromRequest(request),
      method: request.method,
      path: request.originalUrl,
      statusCode: 200,
      success: true,
      sessionId: request.user?.sessionId,
      message: "User logged out."
    });
    response.json({ success: true });
  } catch (error) {
    clearSessionCookies(response);
    response.status(500).json({ error: error.message });
  }
});

router.get("/me", attachAuthContext, requireAuth, (request, response) => {
  response.json({
    user: {
      id: request.user.id,
      email: request.user.email,
      role: request.user.role,
      name: request.user.name
    }
  });
});

export default router;
