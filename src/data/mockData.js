export const rejectionReasons = [
  "Budget Exceeded",
  "Incorrect Pricing",
  "Insufficient Documentation",
  "Duplicate Purchase Request",
  "Vendor Compliance Issue"
];

const rawPurchaseOrderDataset = [
  {
    id: "0121000192",
    date: "2022-04-13",
    org: "2100",
    group: "163",
    status: "PENDING",
    amount: 1106655,
    items: [
      {
        itemNo: 10,
        description: "Cotton J34 RG",
        material: "RDCOJRGRHR011",
        qty: 5500,
        unit: "KG",
        price: 201.21,
        total: 1106655
      }
    ]
  },
  {
    id: "0121000197",
    date: "2022-06-07",
    org: "2100",
    group: "164",
    status: "PENDING",
    amount: 4000000,
    items: [
      {
        itemNo: 10,
        description: "Cotton BCI SG",
        material: "RDCOBSGRPB001",
        qty: 16000,
        unit: "KG",
        price: 250,
        total: 4000000
      }
    ]
  },
  {
    id: "0221000184",
    date: "2022-04-13",
    org: "2100",
    group: "107",
    status: "PENDING",
    amount: 800,
    items: [
      {
        itemNo: 10,
        description: "BALL BEARING",
        material: "GSBGBB000017362",
        qty: 2,
        unit: "ST",
        price: 200,
        total: 400
      },
      {
        itemNo: 20,
        description: "BALL BEARING",
        material: "GSBGBB000017362",
        qty: 2,
        unit: "ST",
        price: 200,
        total: 400
      }
    ]
  },
  {
    id: "0221000185",
    date: "2022-04-13",
    org: "2100",
    group: "107",
    status: "PENDING",
    amount: 100000,
    items: [
      {
        itemNo: 10,
        description: "BALL BEARING",
        material: "GSBGBB000017362",
        qty: 500,
        unit: "ST",
        price: 200,
        total: 100000
      }
    ]
  },
  {
    id: "0221000189",
    date: "2022-05-26",
    org: "2100",
    group: "107",
    status: "PENDING",
    amount: 2000,
    items: [
      {
        itemNo: 10,
        description: "BALL BEARING",
        material: "GSBGBB000017362",
        qty: 1,
        unit: "ST",
        price: 2000,
        total: 2000
      }
    ]
  },
  {
    id: "0221000259",
    date: "2025-05-17",
    org: "2100",
    group: "164",
    status: "PENDING",
    amount: 1000,
    items: [
      {
        itemNo: 10,
        description: "Pur YRN RF 1/15 COMBED HOS 100% Cot.",
        material: "PRCCH0115XXXXXX00",
        qty: 1000,
        unit: "KG",
        price: 1,
        total: 1000
      }
    ]
  },
  {
    id: "0231000039",
    date: "2022-06-10",
    org: "3100",
    group: "164",
    status: "PENDING",
    amount: 10000,
    items: [
      {
        itemNo: 10,
        description: "420 DIA FAN (2.2 KW)",
        material: "GSELEA000018960",
        qty: 100,
        unit: "NOS",
        price: 100,
        total: 10000
      }
    ]
  },
  {
    id: "0821000055",
    date: "2022-06-08",
    org: "2100",
    group: "183",
    status: "PENDING",
    amount: 164450,
    items: [
      {
        itemNo: 10,
        description: "Pur Yarn RF 02/62 RT",
        material: "PRRKH0262XRTXXX00",
        qty: 1000,
        unit: "KG",
        price: 65,
        total: 65000
      },
      {
        itemNo: 20,
        description: "Pur Yarn RF 02/52 RT",
        material: "PRRKH0252XRTXXX00",
        qty: 1500,
        unit: "KG",
        price: 65,
        total: 97500
      },
      {
        itemNo: 30,
        description: "Pur Yarn RF 03/62 RT",
        material: "PRRKH0362XRT21500",
        qty: 30,
        unit: "KG",
        price: 65,
        total: 1950
      }
    ]
  },
  {
    id: "9100000006",
    date: "2022-06-01",
    org: "2100",
    group: "183",
    status: "PENDING",
    amount: 101365,
    items: [
      {
        itemNo: 10,
        description: "2/50 REV 2000M",
        material: "A5028",
        qty: 500,
        unit: "KG",
        price: 202.73,
        total: 101365
      }
    ]
  }
];

const organizationMeta = {
  "2100": {
    location: "Org 2100",
    purchaseArea: "PO 2100 - Central Procurement",
    plant: "PL2100 - Main Operations",
    address: "Organization 2100 Central Stores"
  },
  "3100": {
    location: "Org 3100",
    purchaseArea: "PO 3100 - Plant Procurement",
    plant: "PL3100 - Plant Operations",
    address: "Organization 3100 Plant Warehouse"
  }
};

const groupMeta = {
  "107": {
    supplierName: "Vendor Group 107",
    purchaseGroup: "PG-107",
    paymentTerms: "Net 15 Days"
  },
  "163": {
    supplierName: "Vendor Group 163",
    purchaseGroup: "PG-163",
    paymentTerms: "Net 30 Days"
  },
  "164": {
    supplierName: "Vendor Group 164",
    purchaseGroup: "PG-164",
    paymentTerms: "Net 45 Days"
  },
  "183": {
    supplierName: "Vendor Group 183",
    purchaseGroup: "PG-183",
    paymentTerms: "Net 30 Days"
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

export const mockPurchaseOrders = rawPurchaseOrderDataset.map((purchaseOrder) => {
  const orgInfo = organizationMeta[purchaseOrder.org] ?? {
    location: `Org ${purchaseOrder.org}`,
    purchaseArea: `PO ${purchaseOrder.org} - Procurement`,
    plant: `PL${purchaseOrder.org} - Operations`,
    address: `Organization ${purchaseOrder.org} delivery location`
  };

  const groupInfo = groupMeta[purchaseOrder.group] ?? {
    supplierName: `Vendor Group ${purchaseOrder.group}`,
    purchaseGroup: `PG-${purchaseOrder.group}`,
    paymentTerms: "Net 30 Days"
  };

  return {
    id: purchaseOrder.id,
    poNumber: purchaseOrder.id,
    supplierName: groupInfo.supplierName,
    location: orgInfo.location,
    totalAmount: purchaseOrder.amount,
    status: "Pending",
    vendorInfo: {
      vendorCode: `VEND-${purchaseOrder.group}`,
      gstNumber: `27ORG${purchaseOrder.org}${purchaseOrder.group}1ZP`,
      address: orgInfo.address,
      contact: "+91 22 4000 1100",
      email: `group${purchaseOrder.group}@procurement.example.com`
    },
    orderDetails: {
      createdDate: toIsoDate(purchaseOrder.date),
      purchaseArea: orgInfo.purchaseArea,
      purchaseGroup: groupInfo.purchaseGroup,
      paymentTerms: groupInfo.paymentTerms,
      incoterms: "DAP - Delivered at Place"
    },
    deliveryInfo: {
      plant: orgInfo.plant,
      deliveryDate: toIsoDate(plusDays(purchaseOrder.date, 7), "10", "00"),
      deliveryAddress: orgInfo.address
    },
    lineItems: purchaseOrder.items.map((item) => ({
      itemNumber: String(item.itemNo).padStart(3, "0"),
      material: item.material,
      description: item.description,
      quantity: item.qty,
      unit: item.unit,
      price: item.price
    })),
    approvalHistory: [
      {
        id: `${purchaseOrder.id}-created`,
        type: "created",
        title: "Created",
        actor: `Org ${purchaseOrder.org} Buyer`,
        role: `Purchase Group ${purchaseOrder.group}`,
        time: toIsoDate(purchaseOrder.date),
        note: `Purchase order ${purchaseOrder.id} created for organization ${purchaseOrder.org}.`
      },
      {
        id: `${purchaseOrder.id}-submitted`,
        type: "submitted",
        title: "Submitted for Approval",
        actor: `Org ${purchaseOrder.org} Buyer`,
        role: `Purchase Group ${purchaseOrder.group}`,
        time: toIsoDate(purchaseOrder.date, "09", "30"),
        note: "Submitted to director approval queue."
      }
    ],
    attachments: []
  };
});
