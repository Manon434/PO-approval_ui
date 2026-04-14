import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    size: Number,
    mimeType: String,
    category: String,
    uploadedAt: String,
    url: String
  },
  { _id: false }
);

const approvalHistorySchema = new mongoose.Schema(
  {
    id: String,
    type: String,
    title: String,
    actor: String,
    role: String,
    time: String,
    note: String,
    reason: String
  },
  { _id: false }
);

const lineItemSchema = new mongoose.Schema(
  {
    itemNumber: String,
    material: String,
    description: String,
    quantity: Number,
    unit: String,
    price: Number
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true },
    frgco: String,
    items: { type: [mongoose.Schema.Types.Mixed], default: [] },
    sapStatusCode: String,
    supplierName: String,
    location: String,
    totalAmount: Number,
    poTotal: Number,
    currency: String,
    status: { type: String, default: "Pending" },
    remark: String,
    approvedBy: String,
    approvedAt: Date,
    decisionSubmittedAt: Date,
    syncState: { type: String, default: "confirmed" },
    statusSource: { type: String, default: "sap" },
    vendorInfo: { type: mongoose.Schema.Types.Mixed, default: {} },
    orderDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
    deliveryInfo: { type: mongoose.Schema.Types.Mixed, default: {} },
    lineItems: { type: [lineItemSchema], default: [] },
    approvalHistory: { type: [approvalHistorySchema], default: [] },
    attachments: { type: [attachmentSchema], default: [] },
    syncInfo: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  {
    minimize: false,
    timestamps: true
  }
);

export const PurchaseOrder = mongoose.models.PurchaseOrder ?? mongoose.model("PurchaseOrder", purchaseOrderSchema);
