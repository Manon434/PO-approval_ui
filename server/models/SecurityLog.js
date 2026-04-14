import mongoose from "mongoose";

const securityLogSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    severity: { type: String, default: "info" },
    userId: String,
    email: String,
    ip: String,
    userAgent: String,
    deviceLabel: String,
    method: String,
    path: String,
    statusCode: Number,
    success: Boolean,
    sessionId: String,
    message: String,
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  {
    minimize: false,
    timestamps: true
  }
);

export const SecurityLog = mongoose.models.SecurityLog ?? mongoose.model("SecurityLog", securityLogSchema);
