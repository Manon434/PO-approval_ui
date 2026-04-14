import { env } from "../config/env.js";
import { upsertPurchaseOrders } from "../repositories/purchaseOrderRepository.js";
import { transformFinalSAPResponse, transformPendingSAPResponse } from "./poTransform.js";
import { fetchFinalPurchaseOrders, fetchPendingPurchaseOrders } from "./sapService.js";

export async function syncPurchaseOrders(frgcoCodes = env.sapFrgcoCodes) {
  const summary = {
    pending: [],
    final: {
      count: 0
    }
  };

  for (const frgco of frgcoCodes) {
    const payload = await fetchPendingPurchaseOrders(frgco);
    const transformedOrders = transformPendingSAPResponse(payload, {
      sapClient: env.sapClient,
      frgco
    });

    await upsertPurchaseOrders(transformedOrders);

    summary.pending.push({
      frgco,
      count: transformedOrders.length
    });
  }

  const finalPayload = await fetchFinalPurchaseOrders();
  const finalOrders = transformFinalSAPResponse(finalPayload, {
    sapClient: env.sapClient
  });

  await upsertPurchaseOrders(finalOrders);
  summary.final.count = finalOrders.length;

  return summary;
}
