import { getAppSetting, setAppSetting } from "../repositories/appSettingsRepository.js";

const DEMO_ACCESS_KEY = "demoAccess";
const defaultDemoAccess = {
  enabled: true
};

export async function getDemoAccess() {
  return getAppSetting(DEMO_ACCESS_KEY, defaultDemoAccess);
}

export async function setDemoAccess(enabled) {
  return setAppSetting(DEMO_ACCESS_KEY, {
    enabled: Boolean(enabled)
  });
}
