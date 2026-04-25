import { isDatabaseReady } from "../config/db.js";
import { AppSetting } from "../models/AppSetting.js";

const inMemorySettings = new Map();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export async function getAppSetting(key, defaultValue) {
  if (isDatabaseReady()) {
    const setting = await AppSetting.findOne({ key }).lean();
    return setting ? setting.value : defaultValue;
  }

  return inMemorySettings.has(key) ? clone(inMemorySettings.get(key)) : defaultValue;
}

export async function setAppSetting(key, value) {
  if (isDatabaseReady()) {
    const setting = await AppSetting.findOneAndUpdate(
      { key },
      { key, value },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true
      }
    ).lean();

    return setting.value;
  }

  inMemorySettings.set(key, clone(value));
  return clone(value);
}
