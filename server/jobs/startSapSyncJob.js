import cron from "node-cron";
import { env, hasSapCredentials } from "../config/env.js";
import { syncPurchaseOrders } from "../services/syncPurchaseOrders.js";
import { markSyncDisabled, markSyncFailed, markSyncStarted, markSyncSucceeded } from "../services/syncState.js";

async function runSync(label) {
  try {
    markSyncStarted();
    const summary = await syncPurchaseOrders();
    const pendingCount = summary.pending.reduce((sum, item) => sum + item.count, 0);
    const totalCount = pendingCount + summary.final.count;
    markSyncSucceeded(summary);
    console.log(
      `[sap-sync] ${label}: synced ${totalCount} purchase-order snapshots (${pendingCount} pending across ${summary.pending.length} approval group(s), ${summary.final.count} final-status records).`
    );
  } catch (error) {
    markSyncFailed(error.message);
    console.error(`[sap-sync] ${label}: sync failed. ${error.message}`);
  }
}

export function startSapSyncJob() {
  if (!hasSapCredentials()) {
    markSyncDisabled("SAP credentials are missing.");
    console.warn("[sap-sync] SAP credentials are missing. Cron job will stay disabled until .env is configured.");
    return null;
  }

  const task = cron.schedule(env.sapSyncCron, async () => {
    await runSync("scheduled run");
  });

  runSync("startup run");

  console.log(`[sap-sync] Cron started with schedule "${env.sapSyncCron}".`);
  return task;
}
