import { isDatabaseReady } from "../config/db.js";
import { SecurityLog } from "../models/SecurityLog.js";

const inMemoryLogs = [];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export async function createSecurityLog(entry) {
  if (isDatabaseReady()) {
    return SecurityLog.create(entry);
  }

  inMemoryLogs.push({
    ...clone(entry),
    createdAt: new Date().toISOString()
  });

  if (inMemoryLogs.length > 2000) {
    inMemoryLogs.shift();
  }

  return entry;
}

export async function countRecentLogs(filter, windowMs) {
  const sinceDate = new Date(Date.now() - windowMs);

  if (isDatabaseReady()) {
    return SecurityLog.countDocuments({
      ...filter,
      createdAt: { $gte: sinceDate }
    });
  }

  return inMemoryLogs.filter((entry) => {
    const createdAt = new Date(entry.createdAt ?? Date.now());
    return createdAt >= sinceDate && Object.entries(filter).every(([key, value]) => entry[key] === value);
  }).length;
}

export async function listRecentLogs(filter, windowMs) {
  const sinceDate = new Date(Date.now() - windowMs);

  if (isDatabaseReady()) {
    return SecurityLog.find({
      ...filter,
      createdAt: { $gte: sinceDate }
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  return inMemoryLogs
    .filter((entry) => {
      const createdAt = new Date(entry.createdAt ?? Date.now());
      return createdAt >= sinceDate && Object.entries(filter).every(([key, value]) => entry[key] === value);
    })
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .map((entry) => clone(entry));
}
