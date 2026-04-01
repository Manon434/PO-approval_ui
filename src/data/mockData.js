export const rejectionReasons = [
  "Budget Exceeded",
  "Incorrect Pricing",
  "Insufficient Documentation",
  "Duplicate Purchase Request",
  "Vendor Compliance Issue"
];

const rawPurchaseOrderDataset = [
  {
    poNumber: "0121000192",
    items: [
      { item: 10, material: "Cotton J34 RG", quantity: 5500, unit: "KG", price: 201.21, total: 1106655 }
    ]
  },
  {
    poNumber: "0121000197",
    items: [
      { item: 10, material: "Cotton BCI SG", quantity: 16000, unit: "KG", price: 250, total: 4000000 }
    ]
  },
  {
    poNumber: "0221000184",
    items: [
      { item: 10, material: "BALL BEARING", quantity: 2, unit: "ST", price: 200, total: 400 },
      { item: 20, material: "BALL BEARING", quantity: 2, unit: "ST", price: 200, total: 400 }
    ]
  },
  {
    poNumber: "0221000185",
    items: [{ item: 10, material: "BALL BEARING", quantity: 500, unit: "ST", price: 200, total: 100000 }]
  },
  {
    poNumber: "0221000189",
    items: [{ item: 10, material: "BALL BEARING", quantity: 1, unit: "ST", price: 2000, total: 2000 }]
  },
  {
    poNumber: "0221000259",
    items: [
      { item: 10, material: "Pur YRN RF 1/15  COMBED HOS  100% Cot.", quantity: 1000, unit: "KG", price: 1, total: 1000 }
    ]
  },
  {
    poNumber: "0231000039",
    items: [
      { item: 10, material: "420 DIA FAN (2.2 KW)-3FJD00770000 (ELGI)", quantity: 100, unit: "NOS", price: 100, total: 10000 }
    ]
  },
  {
    poNumber: "0821000029",
    items: [{ item: 10, material: "Reprocess Cotton", quantity: 12, unit: "KG", price: 15, total: 180 }]
  },
  {
    poNumber: "0821000030",
    items: [{ item: 10, material: "Reprocess Cotton", quantity: 1, unit: "KG", price: 15, total: 15 }]
  },
  {
    poNumber: "0821000031",
    items: [{ item: 10, material: "Reprocess Cotton", quantity: 1, unit: "KG", price: 15, total: 15 }]
  },
  {
    poNumber: "0821000032",
    items: [{ item: 10, material: "Reprocess Cotton", quantity: 1, unit: "KG", price: 1, total: 1 }]
  },
  {
    poNumber: "0821000033",
    items: [{ item: 10, material: "Reprocess Cotton", quantity: 1, unit: "KG", price: 1, total: 1 }]
  },
  {
    poNumber: "0821000034",
    items: [{ item: 10, material: "Reprocess Cotton", quantity: 1, unit: "KG", price: 1, total: 1 }]
  },
  {
    poNumber: "0821000035",
    items: [{ item: 10, material: "Pur Yarn RF 02/62 RT 100% Poly.", quantity: 25, unit: "KG", price: 200, total: 5000 }]
  },
  {
    poNumber: "0821000036",
    items: [{ item: 10, material: "Pur Yarn RF 03/62 RT 100% Poly.", quantity: 50, unit: "KG", price: 50, total: 2500 }]
  },
  {
    poNumber: "0821000038",
    items: [
      { item: 10, material: "Pur DY Yarn RF 02/52 21.5 RT 100% Poly.", quantity: 50, unit: "KG", price: 50, total: 2500 }
    ]
  },
  {
    poNumber: "0821000039",
    items: [
      { item: 10, material: "Pur DY Yarn RF 02/62 22.5 RT 100% Poly.", quantity: 50, unit: "KG", price: 200, total: 10000 }
    ]
  },
  {
    poNumber: "0821000040",
    items: [
      { item: 10, material: "Pur DY Yrn RF 03/62 RT COL 100% Poly.", quantity: 50, unit: "KG", price: 50, total: 2500 }
    ]
  },
  {
    poNumber: "0821000041",
    items: [{ item: 10, material: "Pur DY Yarn RF 3/42 18.5 100% POLY.", quantity: 50, unit: "KG", price: 200, total: 10000 }]
  },
  {
    poNumber: "0821000042",
    items: [
      { item: 10, material: "Pur DY Yarn RF 02/62 22.5 RT 100% Poly.", quantity: 50, unit: "KG", price: 200, total: 10000 }
    ]
  },
  {
    poNumber: "0821000044",
    items: [
      { item: 10, material: "Yarn RF 1/10 COMBED HOSIERY 100% Cot.", quantity: 100, unit: "KG", price: 250, total: 25000 }
    ]
  },
  {
    poNumber: "0821000045",
    items: [
      { item: 10, material: "Yarn RF 1/10 COMBED HOSIERY 100% Cot.", quantity: 149, unit: "KG", price: 250, total: 37250 }
    ]
  },
  {
    poNumber: "0821000046",
    items: [
      { item: 10, material: "Pur DY Yrn RF 03/62 RT COL 100% Poly.", quantity: 100, unit: "KG", price: 50, total: 5000 }
    ]
  },
  {
    poNumber: "0821000047",
    items: [
      { item: 10, material: "Pur DY Yrn RF 03/62 RT COL 100% Poly.", quantity: 40, unit: "KG", price: 50, total: 2000 }
    ]
  },
  {
    poNumber: "0821000048",
    items: [
      { item: 10, material: "Pur DY Yrn RF 03/62 RT COL 100% Poly.", quantity: 50, unit: "KG", price: 50, total: 2500 }
    ]
  },
  {
    poNumber: "0821000049",
    items: [
      { item: 10, material: "Pur DY Yrn RF 03/62 RT COL 100% Poly.", quantity: 10, unit: "KG", price: 50, total: 500 }
    ]
  },
  {
    poNumber: "0821000050",
    items: [
      { item: 10, material: "Pur DY Yrn RF 03/62 RT COL 100% Poly.", quantity: 10, unit: "KG", price: 50, total: 500 }
    ]
  },
  {
    poNumber: "0821000051",
    items: [{ item: 10, material: "Pur Yarn RF 02/62 RT 100% Poly.", quantity: 10, unit: "KG", price: 10, total: 100 }]
  },
  {
    poNumber: "0821000052",
    items: [{ item: 10, material: "Pur Yarn RF 02/62 RT 100% Poly.", quantity: 416, unit: "KG", price: 65, total: 27040 }]
  },
  {
    poNumber: "0821000055",
    items: [
      { item: 10, material: "Pur Yarn RF 02/62 RT 100% Poly.", quantity: 1000, unit: "KG", price: 65, total: 65000 },
      { item: 20, material: "Pur Yarn RF 02/52 RT 100% Poly.", quantity: 1500, unit: "KG", price: 65, total: 97500 },
      { item: 30, material: "Pur Yarn RF 03/62 RT 100% Poly.", quantity: 30, unit: "KG", price: 65, total: 1950 }
    ]
  },
  {
    poNumber: "0831000010",
    items: [
      { item: 10, material: "DY YARN 2/30CH DARK MAX BROEN 100%COT.", quantity: 100, unit: "KG", price: 150, total: 15000 }
    ]
  },
  {
    poNumber: "0831000011",
    items: [
      { item: 10, material: "Yarn RF 1/10 COMBED HOS 100% Cot. ORG.", quantity: 50, unit: "KG", price: 100, total: 5000 }
    ]
  },
  {
    poNumber: "0831000017",
    items: [{ item: 10, material: "Yarn RF 2/20 KARDED WARP 100%Cot", quantity: 100, unit: "KG", price: 20, total: 2000 }]
  },
  {
    poNumber: "0921000123",
    items: [{ item: 10, material: "Pur Yarn RF 02/62 RT 100% Poly.", quantity: 100, unit: "KG", price: 326, total: 32600 }]
  },
  {
    poNumber: "0921000124",
    items: [{ item: 10, material: "Pur Yarn RF 3/42 100% POLY.", quantity: 100, unit: "KG", price: 289, total: 28900 }]
  },
  {
    poNumber: "9100000006",
    items: [{ item: 10, material: "2/50 REV 2000M", quantity: 500, unit: "KG", price: 202.73, total: 101365 }]
  }
];

const locationMetaByPrefix = {
  "01": {
    location: "Ahmedabad, Gujarat",
    purchaseArea: "Textile Raw Material Procurement",
    plant: "PL01 - Fiber Sourcing Hub",
    address: "Warehouse District 1, Ahmedabad, Gujarat"
  },
  "02": {
    location: "Mumbai, Maharashtra",
    purchaseArea: "Industrial Components Procurement",
    plant: "PL02 - Mechanical Stores",
    address: "Plant Logistics Block, Mumbai, Maharashtra"
  },
  "08": {
    location: "Bengaluru, Karnataka",
    purchaseArea: "Yarn and Polymer Procurement",
    plant: "PL08 - Textile Finishing Unit",
    address: "Production Campus 8, Bengaluru, Karnataka"
  },
  "09": {
    location: "Hyderabad, Telangana",
    purchaseArea: "Synthetic Yarn Procurement",
    plant: "PL09 - Materials Distribution Center",
    address: "Supply Chain Park, Hyderabad, Telangana"
  },
  "91": {
    location: "Coimbatore, Tamil Nadu",
    purchaseArea: "Legacy Procurement Queue",
    plant: "PL91 - Export Yarn Division",
    address: "Export Materials Yard, Coimbatore, Tamil Nadu"
  }
};

function toIsoDate(dateValue, hour = "09", minute = "00") {
  return `${dateValue}T${hour}:${minute}:00+05:30`;
}

function plusDays(dateValue, days) {
  const date = new Date(`${dateValue}T00:00:00+05:30`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function deriveMeta(poNumber) {
  const prefix = poNumber.slice(0, 2);
  const orgCode = `${prefix}00`;
  const groupCode = poNumber.slice(2, 4);
  const locationMeta = locationMetaByPrefix[prefix] ?? {
    location: `Org ${orgCode}`,
    purchaseArea: `PO ${orgCode} - Director Procurement`,
    plant: `PL${orgCode} - Central Operations`,
    address: `Director Review Warehouse, Org ${orgCode}`
  };

  return {
    orgCode,
    groupCode,
    ...locationMeta
  };
}

function buildSupplierName(material) {
  const upperMaterial = material.toUpperCase();

  if (upperMaterial.includes("COTTON")) {
    return "Cotton Supply Partner";
  }

  if (upperMaterial.includes("YARN")) {
    return "Yarn Procurement Partner";
  }

  if (upperMaterial.includes("BEARING")) {
    return "Industrial Spares Vendor";
  }

  if (upperMaterial.includes("FAN")) {
    return "Plant Equipment Vendor";
  }

  return "Procurement Vendor";
}

export const mockPurchaseOrders = rawPurchaseOrderDataset.map((purchaseOrder, index) => {
  const firstItem = purchaseOrder.items[0];
  const meta = deriveMeta(purchaseOrder.poNumber);
  const createdDate = plusDays("2026-03-01", index);
  const totalAmount = purchaseOrder.items.reduce((sum, item) => sum + Number(item.total ?? item.quantity * item.price), 0);
  const supplierName = buildSupplierName(firstItem?.material ?? "");

  return {
    id: purchaseOrder.poNumber,
    poNumber: purchaseOrder.poNumber,
    supplierName,
    location: meta.location,
    totalAmount,
    status: "Pending",
    vendorInfo: {
      vendorCode: `VEND-${purchaseOrder.poNumber.slice(-4)}`,
      gstNumber: `27ORG${meta.orgCode}${meta.groupCode}1ZP`,
      address: meta.address,
      contact: "+91 22 4000 1100",
      email: `vendor${purchaseOrder.poNumber.slice(-4)}@procurement.example.com`
    },
    orderDetails: {
      createdDate: toIsoDate(createdDate),
      purchaseArea: meta.purchaseArea,
      purchaseGroup: `PG-${meta.groupCode}`,
      paymentTerms: "Net 30 Days",
      incoterms: "DAP - Delivered at Place"
    },
    deliveryInfo: {
      plant: meta.plant,
      deliveryDate: toIsoDate(plusDays(createdDate, 7), "10", "00"),
      deliveryAddress: meta.address
    },
    lineItems: purchaseOrder.items.map((item) => ({
      itemNumber: String(item.item).padStart(3, "0"),
      material: item.material,
      description: item.material,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price
    })),
    approvalHistory: [
      {
        id: `${purchaseOrder.poNumber}-created`,
        type: "created",
        title: "Created",
        actor: `${meta.location} Buyer`,
        role: `Purchase Group ${meta.groupCode}`,
        time: toIsoDate(createdDate),
        note: `Purchase order ${purchaseOrder.poNumber} was prepared for director review.`
      },
      {
        id: `${purchaseOrder.poNumber}-submitted`,
        type: "submitted",
        title: "Submitted for Approval",
        actor: `${meta.location} Buyer`,
        role: `Purchase Group ${meta.groupCode}`,
        time: toIsoDate(createdDate, "09", "30"),
        note: "Submitted to director approval queue."
      }
    ],
    attachments: []
  };
});
