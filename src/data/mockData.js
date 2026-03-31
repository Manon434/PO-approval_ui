export const managerLimit = 500000;

export const rejectionReasons = [
  "Budget Exceeded",
  "Incorrect Pricing",
  "Insufficient Documentation",
  "Duplicate Purchase Request",
  "Vendor Compliance Issue"
];

export const mockPurchaseOrders = [
  {
    id: "4500012345",
    poNumber: "4500012345",
    supplierName: "Tata Motors Limited",
    location: "Mumbai, Maharashtra",
    totalAmount: 485000,
    status: "Pending",
    vendorInfo: {
      vendorCode: "VEND-0001",
      gstNumber: "27AAACT2727Q1ZV",
      address: "Bombay House Annexe, Colaba, Mumbai, Maharashtra",
      contact: "+91 22 6665 8282",
      email: "procurement@tatamotors.com"
    },
    orderDetails: {
      createdDate: "2026-03-25T09:00:00+05:30",
      purchaseArea: "PO01 - Corporate Procurement",
      purchaseGroup: "PG-AUTO",
      paymentTerms: "Net 30 Days",
      incoterms: "DAP - Delivered at Place"
    },
    deliveryInfo: {
      plant: "PL01 - Pune Assembly",
      deliveryDate: "2026-04-09T10:30:00+05:30",
      deliveryAddress: "Pimpri Industrial Area, Pune - 411018"
    },
    lineItems: [
      {
        itemNumber: "010",
        material: "MAT-CHS-212",
        description: "Hydraulic Chassis Mount Kit",
        quantity: 25,
        unit: "EA",
        price: 8600
      },
      {
        itemNumber: "020",
        material: "MAT-BRG-415",
        description: "Industrial Bearing Assembly",
        quantity: 50,
        unit: "EA",
        price: 5400
      }
    ],
    approvalHistory: [
      {
        id: "tat-1",
        type: "created",
        title: "Created",
        actor: "Aarav Kulkarni",
        role: "Procurement Analyst",
        time: "2026-03-25T09:00:00+05:30",
        note: "Rush requirement for chassis maintenance stock."
      },
      {
        id: "tat-2",
        type: "submitted",
        title: "Submitted for Approval",
        actor: "Aarav Kulkarni",
        role: "Procurement Analyst",
        time: "2026-03-25T09:20:00+05:30"
      }
    ]
  },
  {
    id: "4500012346",
    poNumber: "4500012346",
    supplierName: "Reliance Industries Limited",
    location: "Mumbai, Maharashtra",
    totalAmount: 1250000,
    status: "Pending",
    vendorInfo: {
      vendorCode: "VEND-0002",
      gstNumber: "27AAACR5055K1Z1",
      address: "Maker Chambers IV, Nariman Point, Mumbai, Maharashtra",
      contact: "+91 22 3555 5000",
      email: "vendor.support@ril.com"
    },
    orderDetails: {
      createdDate: "2026-03-26T10:00:00+05:30",
      purchaseArea: "PO02 - Energy Sourcing",
      purchaseGroup: "PG-OIL",
      paymentTerms: "Net 45 Days",
      incoterms: "FOB - Free on Board"
    },
    deliveryInfo: {
      plant: "PL08 - Jamnagar Refinery",
      deliveryDate: "2026-04-15T08:00:00+05:30",
      deliveryAddress: "Village Meghpar, Jamnagar, Gujarat - 361140"
    },
    lineItems: [
      {
        itemNumber: "010",
        material: "MAT-LUB-992",
        description: "Refinery Grade Lubricant Drums",
        quantity: 120,
        unit: "DR",
        price: 6500
      },
      {
        itemNumber: "020",
        material: "MAT-SFT-450",
        description: "High Pressure Safety Valves",
        quantity: 40,
        unit: "EA",
        price: 11750
      }
    ],
    approvalHistory: [
      {
        id: "ril-1",
        type: "created",
        title: "Created",
        actor: "Nisha Shah",
        role: "Sourcing Specialist",
        time: "2026-03-26T10:00:00+05:30",
        note: "Annual maintenance shutdown procurement package."
      },
      {
        id: "ril-2",
        type: "submitted",
        title: "Submitted for Approval",
        actor: "Nisha Shah",
        role: "Sourcing Specialist",
        time: "2026-03-26T10:30:00+05:30"
      }
    ]
  },
  {
    id: "4500012347",
    poNumber: "4500012347",
    supplierName: "Infosys Limited",
    location: "Bengaluru, Karnataka",
    totalAmount: 350000,
    status: "Pending",
    vendorInfo: {
      vendorCode: "VEND-0003",
      gstNumber: "29AAACI1543N1Z4",
      address: "Electronics City Phase 1, Bengaluru, Karnataka",
      contact: "+91 80 2852 0261",
      email: "enterprise.sales@infosys.com"
    },
    orderDetails: {
      createdDate: "2026-03-27T11:15:00+05:30",
      purchaseArea: "PO03 - IT Services",
      purchaseGroup: "PG-ITS",
      paymentTerms: "Net 15 Days",
      incoterms: "DDP - Delivered Duty Paid"
    },
    deliveryInfo: {
      plant: "PL12 - Bengaluru Tech Hub",
      deliveryDate: "2026-04-03T09:30:00+05:30",
      deliveryAddress: "Outer Ring Road, Bellandur, Bengaluru - 560103"
    },
    lineItems: [
      {
        itemNumber: "010",
        material: "MAT-SVC-121",
        description: "Application Support Retainer",
        quantity: 1,
        unit: "LOT",
        price: 210000
      },
      {
        itemNumber: "020",
        material: "MAT-LIC-334",
        description: "Cloud Monitoring License Pack",
        quantity: 20,
        unit: "EA",
        price: 7000
      }
    ],
    approvalHistory: [
      {
        id: "inf-1",
        type: "created",
        title: "Created",
        actor: "Meera Iyer",
        role: "IT Procurement Lead",
        time: "2026-03-27T11:15:00+05:30",
        note: "Quarterly support renewal for enterprise monitoring stack."
      },
      {
        id: "inf-2",
        type: "submitted",
        title: "Submitted for Approval",
        actor: "Meera Iyer",
        role: "IT Procurement Lead",
        time: "2026-03-27T11:40:00+05:30"
      }
    ]
  },
  {
    id: "4500012348",
    poNumber: "4500012348",
    supplierName: "Mahindra & Mahindra Ltd",
    location: "Mumbai, Maharashtra",
    totalAmount: 50000,
    status: "Pending",
    vendorInfo: {
      vendorCode: "VEND-0004",
      gstNumber: "27AABCM9407G1ZP",
      address: "Mahindra Towers, Dr. G.M. Bhosale Marg, Mumbai, Maharashtra",
      contact: "+91 22 2490 1441",
      email: "vendor.mgmt@mahindra.com"
    },
    orderDetails: {
      createdDate: "2026-03-28T09:00:00+05:30",
      purchaseArea: "PO01 - India Procurement",
      purchaseGroup: "PG-MFG",
      paymentTerms: "Net 15 Days",
      incoterms: "DAP - Delivered at Place"
    },
    deliveryInfo: {
      plant: "PL02 - Nashik Plant",
      deliveryDate: "2026-04-05T11:00:00+05:30",
      deliveryAddress: "Nashik Plant, Gonde, Nashik - 422403"
    },
    lineItems: [
      {
        itemNumber: "010",
        material: "MAT-SPR-301",
        description: "Helical Compression Spring - 12mm",
        quantity: 1000,
        unit: "EA",
        price: 30
      },
      {
        itemNumber: "020",
        material: "MAT-BSH-088",
        description: "Bronze Bush Bearing - 25x30x20",
        quantity: 200,
        unit: "EA",
        price: 100
      }
    ],
    approvalHistory: [
      {
        id: "mah-1",
        type: "created",
        title: "Created",
        actor: "Sunita Patil",
        role: "Production Planner",
        time: "2026-03-28T09:00:00+05:30",
        note: "Urgent requirement for assembly line."
      },
      {
        id: "mah-2",
        type: "submitted",
        title: "Submitted for Approval",
        actor: "Sunita Patil",
        role: "Production Planner",
        time: "2026-03-28T09:30:00+05:30"
      }
    ]
  },
  {
    id: "4500012349",
    poNumber: "4500012349",
    supplierName: "Larsen & Toubro Limited",
    location: "Mumbai, Maharashtra",
    totalAmount: 1500000,
    status: "Pending",
    vendorInfo: {
      vendorCode: "VEND-0005",
      gstNumber: "27AAACL0140P1ZL",
      address: "L&T House, Ballard Estate, Mumbai, Maharashtra",
      contact: "+91 22 6752 5656",
      email: "projects.procurement@larsentoubro.com"
    },
    orderDetails: {
      createdDate: "2026-03-29T14:10:00+05:30",
      purchaseArea: "PO05 - Capital Projects",
      purchaseGroup: "PG-CAP",
      paymentTerms: "Net 60 Days",
      incoterms: "CIP - Carriage and Insurance Paid"
    },
    deliveryInfo: {
      plant: "PL19 - Hazira Heavy Engineering",
      deliveryDate: "2026-04-18T09:00:00+05:30",
      deliveryAddress: "Hazira Manufacturing Complex, Surat - 394270"
    },
    lineItems: [
      {
        itemNumber: "010",
        material: "MAT-CTL-610",
        description: "Industrial Control Panel Assembly",
        quantity: 10,
        unit: "EA",
        price: 55000
      },
      {
        itemNumber: "020",
        material: "MAT-CBL-190",
        description: "High Load Armoured Cable Drum",
        quantity: 20,
        unit: "DR",
        price: 22500
      },
      {
        itemNumber: "030",
        material: "MAT-MTR-220",
        description: "Variable Frequency Drive Motor",
        quantity: 2,
        unit: "EA",
        price: 250000
      }
    ],
    approvalHistory: [
      {
        id: "lt-1",
        type: "created",
        title: "Created",
        actor: "Raghav Menon",
        role: "Project Buyer",
        time: "2026-03-29T14:10:00+05:30",
        note: "Critical capital equipment package for expansion project."
      },
      {
        id: "lt-2",
        type: "submitted",
        title: "Submitted for Approval",
        actor: "Raghav Menon",
        role: "Project Buyer",
        time: "2026-03-29T14:45:00+05:30"
      }
    ]
  }
];
