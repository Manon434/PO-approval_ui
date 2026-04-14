import mongoose from "mongoose";
import { env } from "./env.js";

let connectionAttempted = false;
let usingDatabase = false;

export async function connectDatabase() {
  if (connectionAttempted) {
    return usingDatabase;
  }

  connectionAttempted = true;

  if (!env.mongoUri) {
    console.warn("[db] MONGO_URI is not configured. Falling back to in-memory storage.");
    return false;
  }

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    usingDatabase = true;
    console.log("[db] Connected to MongoDB.");
    return true;
  } catch (error) {
    console.warn(`[db] MongoDB connection failed. Falling back to in-memory storage. ${error.message}`);
    return false;
  }
}

export function isDatabaseReady() {
  return usingDatabase && mongoose.connection.readyState === 1;
}
