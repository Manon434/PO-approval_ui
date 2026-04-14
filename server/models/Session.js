import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    refreshTokenHash: { type: String, required: true },
    ip: String,
    userAgent: String,
    deviceLabel: String,
    expiresAt: { type: Date, required: true },
    revokedAt: Date
  },
  {
    timestamps: true
  }
);

export const Session = mongoose.models.Session ?? mongoose.model("Session", sessionSchema);
