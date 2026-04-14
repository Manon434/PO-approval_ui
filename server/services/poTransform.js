function unwrapSapPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (typeof payload === "string") {
    try {
      return unwrapSapPayload(JSON.parse(payload));
    } catch {
      return [];
    }
  }

  if (Array.isArray(payload?.d?.results)) {
    return payload.d.results;
  }

  if (Array.isArray(payload?.value)) {
    return payload.value;
  }

  if (payload && typeof payload === "object") {
    return [payload];
  }

  return [];
}

function parseNumber(value) {
  if (typeof value === "number") {
    return value;
  }

  const normalizedValue = String(value ?? "").replace(/,/g, "").trim();
  const parsedNumber = Number(normalizedValue);
  return Number.isFinite(parsedNumber) ? parsedNumber : 0;
}

function normalizeText(value, fallback = "") {
  return String(value ?? fallback)
    .replace(/\u00c2/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSapDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const rawValue = String(value).trim();
  const odataDateMatch = rawValue.match(/\/Date\((\d+)\)\//);

  if (odataDateMatch) {
    return new Date(Number(odataDateMatch[1])).toISOString();
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    return new Date(`${rawValue}T09:00:00+05:30`).toISOString();
  }

  if (/^\d{8}$/.test(rawValue)) {
    const year = rawValue.slice(0, 4);
    const month = rawValue.slice(4, 6);
    const day = rawValue.slice(6, 8);
    return new Date(`${year}-${month}-${day}T09:00:00+05:30`).toISOString();
  }

  const parsedDate = new Date(rawValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
}

function combineSapDateTime(dateValue, timeValue) {
  const normalizedDate = dateValue ? String(dateValue).trim() : "";

  if (!normalizedDate) {
    return null;
  }

  const normalizedTime = normalizeText(timeValue, "00:00:00");
  const time = /^\d{2}:\d{2}:\d{2}$/.test(normalizedTime) ? normalizedTime : "00:00:00";
  return new Date(`${normalizedDate}T${time}+05:30`).toISOString();
}

function mapStatusCode(code) {
  if (code === "A") {
    return "Approved";
  }

  if (code === "R") {
    return "Rejected";
  }

  return "Pending";
}

function deriveCreatedDate(row) {
  return (
    parseSapDate(row.BEDAT) ??
    parseSapDate(row.AEDAT) ??
    parseSapDate(row.ERDAT) ??
    parseSapDate(row.CPUDT) ??
    new Date().toISOString()
  );
}

function deriveDeliveryDate(row, createdDate) {
  const explicitDate = parseSapDate(row.EINDT) ?? parseSapDate(row.LFDAT);

  if (explicitDate) {
    return explicitDate;
  }

  const date = new Date(createdDate);
  date.setDate(date.getDate() + 7);
  return date.toISOString();
}

function deriveSupplierName(row) {
  return (
    normalizeText(row.NAME1) ||
    normalizeText(row.LIFNR) ||
    normalizeText(row.TXZ01) ||
    "SAP Procurement Vendor"
  );
}

function deriveLocation(row, fallbackFrgco) {
  const locationParts = [normalizeText(row.CITY1), normalizeText(row.REGIO)].filter(Boolean);

  if (locationParts.length > 0) {
    return locationParts.join(", ");
  }

  if (row.WERKS) {
    return `Plant ${normalizeText(row.WERKS)}`;
  }

  return `Org ${normalizeText(row.EKORG || fallbackFrgco || "SAP")}`;
}

function buildAddress(row) {
  const addressParts = [
    normalizeText(row.STRAS),
    normalizeText(row.ORT01),
    normalizeText(row.CITY1),
    normalizeText(row.REGIO)
  ].filter(Boolean);

  return addressParts.length > 0 ? addressParts.join(", ") : "Address not provided by SAP";
}

function buildApprovalHistory(order, sourceLabel) {
  const history = [
    {
      id: `${order.poNumber}-created`,
      type: "created",
      title: "Created",
      actor: "SAP Procurement",
      role: `Purchase Group ${order.orderDetails.purchaseGroup || "SAP"}`,
      time: order.orderDetails.createdDate,
      note: `Purchase order ${order.poNumber} was synced from ${sourceLabel}.`
    },
    {
      id: `${order.poNumber}-submitted`,
      type: "submitted",
      title: "Submitted for Approval",
      actor: "SAP Procurement",
      role: order.frgco ? `Release Code ${order.frgco}` : "Director Approval",
      time: order.orderDetails.createdDate,
      note: "Purchase order is available in the approval workflow."
    }
  ];

  if (order.status === "Approved" || order.status === "Rejected") {
    history.push({
      id: `${order.poNumber}-${order.status.toLowerCase()}`,
      type: order.status.toLowerCase(),
      title: order.status,
      actor: order.approvedBy || "Director",
      role: order.frgco ? `Release Code ${order.frgco}` : "Director Approval",
      time: order.approvedAt || order.decisionSubmittedAt || order.orderDetails.createdDate,
      note: order.remark || `Purchase order ${order.status.toLowerCase()} in SAP.`
    });
  }

  return history;
}

function transformRowsToPurchaseOrders(rows, { sapClient, fallbackFrgco, sourceLabel, sourceKind }) {
  const groupedOrders = {};
  const syncedAt = new Date().toISOString();

  for (const row of rows) {
    if (row.LOEKZ || row.ELIKZ) {
      continue;
    }

    const poNumber = normalizeText(row.EBELN);

    if (!poNumber) {
      continue;
    }

    const itemNumber = normalizeText(row.EBELP || row.EBELP_NO || "10");
    const quantity = parseNumber(row.MENGE);
    const price = parseNumber(row.NETPR);
    const lineTotal = parseNumber(row.NETWR) || quantity * price;
    const createdDate = deriveCreatedDate(row);
    const deliveryDate = deriveDeliveryDate(row, createdDate);
    const statusCode = normalizeText(row.STATUS);
    const status = sourceKind === "final" ? mapStatusCode(statusCode) : "Pending";
    const approvalTimestamp = combineSapDateTime(row.ZDATE, row.ZTIME);
    const frgco = normalizeText(row.FRGCO || fallbackFrgco);

    if (!groupedOrders[poNumber]) {
      groupedOrders[poNumber] = {
        id: poNumber,
        poNumber,
        frgco: frgco || null,
        items: [],
        supplierName: deriveSupplierName(row),
        location: deriveLocation(row, fallbackFrgco),
        totalAmount: 0,
        poTotal: 0,
        currency: normalizeText(row.WAERS, "INR"),
        status,
        sapStatusCode: statusCode || "",
        remark: normalizeText(row.REMARK),
        approvedBy: frgco || null,
        approvedAt: approvalTimestamp,
        decisionSubmittedAt: approvalTimestamp,
        syncState: "confirmed",
        statusSource: "sap",
        vendorInfo: {
          vendorCode: normalizeText(row.LIFNR, `SAP-${poNumber.slice(-4)}`),
          gstNumber: normalizeText(row.STCD3 || row.STCD1, "Not provided by SAP"),
          address: buildAddress(row),
          contact: normalizeText(row.TELF1, "Not provided by SAP"),
          email: normalizeText(row.SMTP_ADDR, `sap.vendor.${poNumber.slice(-4)}@example.com`)
        },
        orderDetails: {
          createdDate,
          purchaseArea: normalizeText(row.EKORG, "SAP Purchase Org"),
          purchaseGroup: normalizeText(row.EKGRP || frgco, "SAP"),
          paymentTerms: normalizeText(row.ZTERM, "As per SAP terms"),
          incoterms: normalizeText([row.INCO1, row.INCO2].filter(Boolean).join(" - "), "Not provided by SAP")
        },
        deliveryInfo: {
          plant: normalizeText(row.WERKS, "SAP Plant"),
          deliveryDate,
          deliveryAddress: buildAddress(row)
        },
        lineItems: [],
        approvalHistory: [],
        attachments: [],
        syncInfo: {
          sapClient,
          source: sourceKind,
          frgco: frgco || null,
          lastSyncedAt: syncedAt
        }
      };
    }

    groupedOrders[poNumber].items.push({
      item: parseNumber(itemNumber),
      material: normalizeText(row.EMATN || row.MATNR || row.TXZ01, "SAP Material"),
      description: normalizeText(row.TXZ01, "SAP line item"),
      quantity,
      unit: normalizeText(row.MEINS),
      price,
      total: lineTotal
    });

    groupedOrders[poNumber].lineItems.push({
      itemNumber: itemNumber.padStart(3, "0"),
      material: normalizeText(row.EMATN || row.MATNR || row.TXZ01, "SAP Material"),
      description: normalizeText(row.TXZ01, "SAP line item"),
      quantity,
      unit: normalizeText(row.MEINS),
      price
    });

    groupedOrders[poNumber].totalAmount += lineTotal;
    groupedOrders[poNumber].poTotal = groupedOrders[poNumber].totalAmount;

    if (sourceKind === "final") {
      if (statusCode) {
        groupedOrders[poNumber].sapStatusCode = statusCode;
        groupedOrders[poNumber].status = mapStatusCode(statusCode);
      }

      if (Object.prototype.hasOwnProperty.call(row, "REMARK")) {
        groupedOrders[poNumber].remark = normalizeText(row.REMARK);
      }

      if (approvalTimestamp) {
        groupedOrders[poNumber].approvedAt = approvalTimestamp;
        groupedOrders[poNumber].decisionSubmittedAt = approvalTimestamp;
      }

      if (frgco) {
        groupedOrders[poNumber].approvedBy = frgco;
      }
    }
  }

  return Object.values(groupedOrders).map((order) => ({
    ...order,
    approvalHistory: buildApprovalHistory(order, sourceLabel)
  }));
}

export function transformPendingSAPResponse(payload, { sapClient, frgco }) {
  return transformRowsToPurchaseOrders(unwrapSapPayload(payload), {
    sapClient,
    fallbackFrgco: frgco,
    sourceLabel: "SAP pending queue",
    sourceKind: "pending"
  });
}

export function transformFinalSAPResponse(payload, { sapClient }) {
  return transformRowsToPurchaseOrders(unwrapSapPayload(payload), {
    sapClient,
    fallbackFrgco: "",
    sourceLabel: "SAP final status queue",
    sourceKind: "final"
  });
}
