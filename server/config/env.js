import dotenv from "dotenv";

dotenv.config();

function parseFrgcoCodes(value) {
  return String(value ?? "D1")
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean);
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGO_URI ?? "",
  sapClient: String(process.env.SAP_CLIENT ?? "100"),
  sapMandt: process.env.SAP_MANDT ?? "SIL",
  sapPendingUrl: process.env.SAP_PENDING_URL ?? "http://203.112.143.241:8000/zpo_apr/PODAT",
  sapFinalUrl: process.env.SAP_FINAL_URL ?? "http://203.112.143.241:8000/zpo_rel/PODAT",
  sapApprovalUrl: process.env.SAP_APPROVAL_URL ?? "http://203.112.143.241:8000/zpo_rel/PODAT",
  sapUser: process.env.SAP_USER ?? "",
  sapPass: process.env.SAP_PASS ?? "",
  sapFrgcoCodes: parseFrgcoCodes(process.env.SAP_FRGCO_CODES),
  sapSyncCron: process.env.SAP_SYNC_CRON ?? "*/15 * * * *",
  appDirectorEmail: process.env.APP_DIRECTOR_EMAIL ?? "director@pop.local",
  appDirectorPassword: process.env.APP_DIRECTOR_PASSWORD ?? "ChangeMe123!",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me",
  accessTokenTtlMinutes: Number(process.env.ACCESS_TOKEN_TTL_MINUTES ?? 15),
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7),
  cookieSecure: String(process.env.COOKIE_SECURE ?? "false").toLowerCase() === "true"
};

export function hasSapCredentials() {
  return Boolean(env.sapUser && env.sapPass);
}
