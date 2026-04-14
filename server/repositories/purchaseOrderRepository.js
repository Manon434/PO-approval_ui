import { isDatabaseReady } from "../config/db.js";
import { PurchaseOrder } from "../models/PurchaseOrder.js";

const inMemoryStore = new Map();

function sortOrders(orders) {
  return [...orders].sort((left, right) => {
    const dateDifference = new Date(right.orderDetails?.createdDate ?? 0) - new Date(left.orderDetails?.createdDate ?? 0);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return String(right.poNumber).localeCompare(String(left.poNumber));
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeApprovalHistory(existingHistory = [], incomingHistory = []) {
  const historyMap = new Map();

  for (const entry of [...existingHistory, ...incomingHistory]) {
    const entryId = entry?.id ?? `${entry?.title}-${entry?.time}-${entry?.note}`;

    if (!entryId) {
      continue;
    }

    historyMap.set(entryId, {
      ...(historyMap.get(entryId) ?? {}),
      ...entry
    });
  }

  return Array.from(historyMap.values()).sort((left, right) => {
    return new Date(left.time ?? 0) - new Date(right.time ?? 0);
  });
}

function mergePurchaseOrder(existingOrder, incomingOrder) {
  if (!existingOrder) {
    return incomingOrder;
  }

  const incomingSource = incomingOrder?.syncInfo?.source;
  const isPendingSync = incomingSource === "pending";
  const isAwaitingConfirmation =
    existingOrder?.statusSource === "local" && existingOrder?.syncState === "awaiting_confirmation";
  const isLocalDecision = existingOrder?.statusSource === "local" && existingOrder?.status && existingOrder.status !== "Pending";
  const preserveLocalDecision = isPendingSync && (isAwaitingConfirmation || isLocalDecision);

  const decisionFields = preserveLocalDecision
    ? {
        status: existingOrder.status,
        sapStatusCode: existingOrder.sapStatusCode,
        remark: existingOrder.remark,
        approvedBy: existingOrder.approvedBy,
        approvedAt: existingOrder.approvedAt,
        decisionSubmittedAt: existingOrder.decisionSubmittedAt,
        syncState: existingOrder.syncState,
        statusSource: existingOrder.statusSource
      }
    : {
        status: incomingOrder.status ?? existingOrder.status,
        sapStatusCode: incomingOrder.sapStatusCode ?? existingOrder.sapStatusCode,
        remark: incomingOrder.remark ?? existingOrder.remark,
        approvedBy: incomingOrder.approvedBy ?? existingOrder.approvedBy,
        approvedAt: incomingOrder.approvedAt ?? existingOrder.approvedAt,
        decisionSubmittedAt: incomingOrder.decisionSubmittedAt ?? existingOrder.decisionSubmittedAt,
        syncState: incomingOrder.syncState ?? existingOrder.syncState,
        statusSource: incomingOrder.statusSource ?? existingOrder.statusSource
      };

  return {
    ...existingOrder,
    ...incomingOrder,
    items: incomingOrder.items?.length ? incomingOrder.items : existingOrder.items ?? [],
    lineItems: incomingOrder.lineItems?.length ? incomingOrder.lineItems : existingOrder.lineItems ?? [],
    attachments: incomingOrder.attachments?.length ? incomingOrder.attachments : existingOrder.attachments ?? [],
    approvalHistory: mergeApprovalHistory(existingOrder.approvalHistory, incomingOrder.approvalHistory),
    ...decisionFields,
    vendorInfo: {
      ...(existingOrder.vendorInfo ?? {}),
      ...(incomingOrder.vendorInfo ?? {})
    },
    orderDetails: {
      ...(existingOrder.orderDetails ?? {}),
      ...(incomingOrder.orderDetails ?? {})
    },
    deliveryInfo: {
      ...(existingOrder.deliveryInfo ?? {}),
      ...(incomingOrder.deliveryInfo ?? {})
    },
    syncInfo: {
      ...(existingOrder.syncInfo ?? {}),
      ...(incomingOrder.syncInfo ?? {})
    }
  };
}

export async function listPurchaseOrders({ status } = {}) {
  if (isDatabaseReady()) {
    const query = status ? { status } : {};
    const orders = await PurchaseOrder.find(query).lean();
    return sortOrders(orders);
  }

  const orders = Array.from(inMemoryStore.values());
  const filteredOrders = status ? orders.filter((order) => order.status === status) : orders;
  return sortOrders(filteredOrders.map((order) => clone(order)));
}

export async function findPurchaseOrder(poNumber) {
  if (isDatabaseReady()) {
    return PurchaseOrder.findOne({ poNumber }).lean();
  }

  const order = inMemoryStore.get(poNumber);
  return order ? clone(order) : null;
}

export async function listPurchaseOrderStatuses() {
  const orders = await listPurchaseOrders();

  return orders.map((order) => ({
    poNumber: order.poNumber,
    status: order.status,
    remark: order.remark ?? "",
    approvedBy: order.approvedBy ?? "",
    approvedAt: order.approvedAt ?? null,
    syncState: order.syncState ?? "confirmed"
  }));
}

export async function upsertPurchaseOrders(orders) {
  const normalizedOrders = [];

  for (const incomingOrder of orders) {
    if (isDatabaseReady()) {
      const existingOrder = await PurchaseOrder.findOne({ poNumber: incomingOrder.poNumber }).lean();
      const mergedOrder = mergePurchaseOrder(existingOrder, incomingOrder);
      await PurchaseOrder.findOneAndUpdate({ poNumber: incomingOrder.poNumber }, mergedOrder, {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true
      });
      normalizedOrders.push(mergedOrder);
    } else {
      const existingOrder = inMemoryStore.get(incomingOrder.poNumber);
      const mergedOrder = mergePurchaseOrder(existingOrder, incomingOrder);
      inMemoryStore.set(incomingOrder.poNumber, clone(mergedOrder));
      normalizedOrders.push(mergedOrder);
    }
  }

  return normalizedOrders;
}

export async function updatePurchaseOrderDecision(poNumber, updates) {
  if (isDatabaseReady()) {
    const existingOrder = await PurchaseOrder.findOne({ poNumber }).lean();

    if (!existingOrder) {
      return null;
    }

    const nextOrder = mergePurchaseOrder(existingOrder, updates);
    return PurchaseOrder.findOneAndUpdate({ poNumber }, nextOrder, { returnDocument: "after" }).lean();
  }

  const existingOrder = inMemoryStore.get(poNumber);

  if (!existingOrder) {
    return null;
  }

  const nextOrder = mergePurchaseOrder(existingOrder, updates);

  inMemoryStore.set(poNumber, clone(nextOrder));
  return clone(nextOrder);
}
