import { isDatabaseReady } from "../config/db.js";
import { Session } from "../models/Session.js";

const inMemorySessions = new Map();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export async function createSession(session) {
  if (isDatabaseReady()) {
    await Session.findOneAndUpdate({ sessionId: session.sessionId }, session, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
    return session;
  }

  inMemorySessions.set(session.sessionId, clone(session));
  return session;
}

export async function findSession(sessionId) {
  if (isDatabaseReady()) {
    return Session.findOne({ sessionId }).lean();
  }

  const session = inMemorySessions.get(sessionId);
  return session ? clone(session) : null;
}

export async function findSessionByRefreshTokenHash(refreshTokenHash) {
  if (isDatabaseReady()) {
    return Session.findOne({ refreshTokenHash }).lean();
  }

  for (const session of inMemorySessions.values()) {
    if (session.refreshTokenHash === refreshTokenHash) {
      return clone(session);
    }
  }

  return null;
}

export async function revokeSession(sessionId) {
  if (isDatabaseReady()) {
    return Session.findOneAndUpdate({ sessionId }, { revokedAt: new Date() }, { new: true }).lean();
  }

  const existing = inMemorySessions.get(sessionId);
  if (!existing) {
    return null;
  }

  const next = {
    ...existing,
    revokedAt: new Date().toISOString()
  };
  inMemorySessions.set(sessionId, clone(next));
  return next;
}

export async function revokeAllSessionsForUser(userId) {
  if (isDatabaseReady()) {
    await Session.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() });
    return;
  }

  for (const [sessionId, session] of inMemorySessions.entries()) {
    if (session.userId === userId && !session.revokedAt) {
      inMemorySessions.set(sessionId, {
        ...session,
        revokedAt: new Date().toISOString()
      });
    }
  }
}
