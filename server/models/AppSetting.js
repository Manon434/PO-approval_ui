import mongoose from "mongoose";

const appSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  {
    minimize: false,
    timestamps: true
  }
);

export const AppSetting = mongoose.models.AppSetting ?? mongoose.model("AppSetting", appSettingSchema);
