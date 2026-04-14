import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { createSession, findSessionByRefreshTokenHash, revokeSession } from "../repositories/sessionRepository.js";

const ACCESS_COOKIE_NAME = "po_access_token";
const REFRESH_COOKIE_NAME = "po_refresh_token";

function getConfiguredUser() {
  return {
    id: "director-1",
    email: env.appDirectorEmail,
    role: "Director",
    name: "Ananya Rao",
    password: env.appDirectorPassword
  };
}

function buildAccessTokenPayload(user, sessionId) {
  return {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    sid: sessionId
  };
}

function getAccessTokenExpiry() {
  return `${env.accessTokenTtlMinutes}m`;
}

function getRefreshTokenExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.refreshTokenTtlDays);
  return expiresAt;
}

function getCookieBaseOptions(expires) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.cookieSecure,
    expires,
    path: "/"
  };
}

function signAccessToken(user, sessionId) {
  return jwt.sign(buildAccessTokenPayload(user, sessionId), env.jwtAccessSecret, {
    expiresIn: getAccessTokenExpiry()
  });
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

function hashRefreshToken(refreshToken) {
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
}

export async function verifyLoginCredentials(email, password) {
  const user = getConfiguredUser();

  if (email !== user.email) {
    return null;
  }

  const passwordMatches =
    user.password.startsWith("$2") ? await bcrypt.compare(password, user.password) : password === user.password;

  return passwordMatches ? user : null;
}

export async function issueSessionCookies(response, user, requestDetails) {
  const sessionId = crypto.randomUUID();
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const refreshExpiresAt = getRefreshTokenExpiryDate();
  const accessToken = signAccessToken(user, sessionId);

  await createSession({
    sessionId,
    userId: user.id,
    email: user.email,
    role: user.role,
    refreshTokenHash,
    ip: requestDetails.ip,
    userAgent: requestDetails.userAgent,
    deviceLabel: requestDetails.deviceLabel,
    expiresAt: refreshExpiresAt,
    revokedAt: null
  });

  response.cookie(ACCESS_COOKIE_NAME, accessToken, getCookieBaseOptions(new Date(Date.now() + env.accessTokenTtlMinutes * 60 * 1000)));
  response.cookie(REFRESH_COOKIE_NAME, refreshToken, getCookieBaseOptions(refreshExpiresAt));

  return {
    sessionId,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }
  };
}

export function clearSessionCookies(response) {
  response.clearCookie(ACCESS_COOKIE_NAME, { httpOnly: true, sameSite: "lax", secure: env.cookieSecure, path: "/" });
  response.clearCookie(REFRESH_COOKIE_NAME, { httpOnly: true, sameSite: "lax", secure: env.cookieSecure, path: "/" });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export async function restoreSessionFromRefreshToken(refreshToken, response) {
  if (!refreshToken) {
    return null;
  }

  const refreshTokenHash = hashRefreshToken(refreshToken);
  const session = await findSessionByRefreshTokenHash(refreshTokenHash);

  if (!session || session.revokedAt) {
    return null;
  }

  if (new Date(session.expiresAt) <= new Date()) {
    await revokeSession(session.sessionId);
    return null;
  }

  const user = {
    id: session.userId,
    email: session.email,
    role: session.role,
    name: "Ananya Rao"
  };

  const accessToken = signAccessToken(user, session.sessionId);
  response.cookie(
    ACCESS_COOKIE_NAME,
    accessToken,
    getCookieBaseOptions(new Date(Date.now() + env.accessTokenTtlMinutes * 60 * 1000))
  );

  return {
    ...user,
    sessionId: session.sessionId
  };
}

export async function revokeSessionFromRequest(request, response) {
  const refreshToken = request.cookies?.[REFRESH_COOKIE_NAME];

  if (refreshToken) {
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const session = await findSessionByRefreshTokenHash(refreshTokenHash);

    if (session) {
      await revokeSession(session.sessionId);
    }
  }

  clearSessionCookies(response);
}

export const authCookieNames = {
  access: ACCESS_COOKIE_NAME,
  refresh: REFRESH_COOKIE_NAME
};
