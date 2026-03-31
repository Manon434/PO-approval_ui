import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  Mail,
  MapPin,
  ShieldCheck,
  Phone,
  ShieldAlert,
  Truck,
  XCircle
} from "lucide-react";
import { formatCurrency, formatDate } from "../utils/formatters";
import ApprovalTimeline from "./ApprovalTimeline";
import PurchaseOrderAttachments from "./PurchaseOrderAttachments";

function InfoCard({ title, icon: Icon, children }) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-[#f4f6f8] p-4 shadow-panel sm:rounded-[28px] sm:p-6">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#0070b1]" />
        <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h3>
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <div className="mt-2 flex items-start gap-2 text-slate-900">
        {Icon ? <Icon className="mt-1 h-4 w-4 shrink-0 text-slate-400" /> : null}
        <span className="text-sm leading-6 sm:text-base">{value}</span>
      </div>
    </div>
  );
}

function ApprovalDecision({ purchaseOrder, managerLimit, onApprove, onReject }) {
  const withinLimit = purchaseOrder.totalAmount <= managerLimit;

  return (
    <section className="rounded-[24px] border border-slate-200 bg-[#f4f6f8] p-4 shadow-panel sm:rounded-[28px] sm:p-6">
      <div className="flex items-center gap-2">
        <IndianRupee className="h-5 w-5 text-[#0070b1]" />
        <h3 className="text-lg font-semibold text-slate-900">Approval Decision</h3>
      </div>

      <div className="mt-5 rounded-2xl bg-white/70 p-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Manager Limit</span>
            <span className="font-semibold text-slate-900">{formatCurrency(managerLimit)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">PO Amount</span>
            <span className={`font-semibold ${withinLimit ? "text-emerald-600" : "text-amber-600"}`}>
              {formatCurrency(purchaseOrder.totalAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Authority</span>
            <span className={`font-semibold ${withinLimit ? "text-emerald-600" : "text-amber-600"}`}>
              {withinLimit ? "Within Limit" : "Director Approval"}
            </span>
          </div>
        </div>
      </div>

      {!withinLimit ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p>Approval Required by Director: Amount exceeds Manager authority.</p>
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => onApprove(purchaseOrder.id)}
          disabled={!withinLimit}
          className={`flex w-full items-center justify-center rounded-2xl px-4 py-3 text-base font-semibold text-white transition ${
            withinLimit ? "bg-emerald-600 hover:bg-emerald-700" : "cursor-not-allowed bg-slate-300"
          }`}
        >
          <CheckCircle2 className="mr-2 h-5 w-5" />
          Approve
        </button>
        <button
          type="button"
          onClick={() => onReject(purchaseOrder.id)}
          className="flex w-full items-center justify-center rounded-2xl bg-red-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-red-700"
        >
          <XCircle className="mr-2 h-5 w-5" />
          Reject
        </button>
      </div>
    </section>
  );
}

export default function PurchaseOrderDetail({
  purchaseOrder,
  managerLimit,
  onApprove,
  onReject,
  onAttachFiles,
  onBack
}) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 sm:py-5 xl:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0070b1] transition hover:text-sky-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Purchase Order #{purchaseOrder.poNumber}
              </h2>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                {purchaseOrder.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {purchaseOrder.supplierName} | {purchaseOrder.orderDetails.purchaseArea}
            </p>
          </div>

          <div className="rounded-[24px] bg-[#f4f6f8] px-5 py-4 text-left sm:px-6 sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Total Value</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {formatCurrency(purchaseOrder.totalAmount)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6 xl:px-8 xl:py-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-panel">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
              <ClipboardList className="h-4 w-4 text-[#0070b1]" />
              Summary
            </div>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              {purchaseOrder.lineItems.length} line items scheduled for {formatDate(purchaseOrder.deliveryInfo.deliveryDate)}
            </p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-panel">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
              <Truck className="h-4 w-4 text-[#0070b1]" />
              Delivery
            </div>
            <p className="mt-3 text-lg font-semibold text-slate-900">{purchaseOrder.deliveryInfo.plant}</p>
            <p className="mt-1 text-sm text-slate-500">{purchaseOrder.deliveryInfo.deliveryAddress}</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-panel">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
              {purchaseOrder.totalAmount <= managerLimit ? (
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              ) : (
                <ShieldAlert className="h-4 w-4 text-amber-600" />
              )}
              Authority
            </div>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              {purchaseOrder.totalAmount <= managerLimit ? "Manager can approve" : "Director escalation required"}
            </p>
            <p className="mt-1 text-sm text-slate-500">Limit set at {formatCurrency(managerLimit)} for current approver.</p>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-3">
          <InfoCard title="Vendor Information" icon={Building2}>
            <Field label="Vendor Name" value={purchaseOrder.supplierName} />
            <Field label="Vendor Code" value={purchaseOrder.vendorInfo.vendorCode} />
            <Field label="GST Number" value={purchaseOrder.vendorInfo.gstNumber} />
            <Field label="Address" value={purchaseOrder.vendorInfo.address} icon={MapPin} />
            <Field label="Contact" value={purchaseOrder.vendorInfo.contact} icon={Phone} />
            <Field label="Email" value={purchaseOrder.vendorInfo.email} icon={Mail} />
          </InfoCard>

          <InfoCard title="Order Details" icon={CalendarDays}>
            <Field label="PO Number" value={purchaseOrder.poNumber} />
            <Field label="Created Date" value={formatDate(purchaseOrder.orderDetails.createdDate)} icon={CalendarDays} />
            <Field label="Purchase Area" value={purchaseOrder.orderDetails.purchaseArea} />
            <Field label="Purchase Group" value={purchaseOrder.orderDetails.purchaseGroup} />
            <Field label="Payment Terms" value={purchaseOrder.orderDetails.paymentTerms} />
            <Field label="Incoterms" value={purchaseOrder.orderDetails.incoterms} />
          </InfoCard>

          <InfoCard title="Delivery Information" icon={Truck}>
            <Field label="Plant" value={purchaseOrder.deliveryInfo.plant} />
            <Field label="Delivery Date" value={formatDate(purchaseOrder.deliveryInfo.deliveryDate)} icon={CalendarDays} />
            <Field label="Delivery Address" value={purchaseOrder.deliveryInfo.deliveryAddress} icon={MapPin} />
            <Field label="Total Amount" value={formatCurrency(purchaseOrder.totalAmount)} />
          </InfoCard>
        </div>

        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-[#f4f6f8] shadow-panel sm:rounded-[28px]">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#0070b1]" />
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Line Items</h3>
            </div>
            <p className="text-sm text-slate-400">{purchaseOrder.lineItems.length} items</p>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {purchaseOrder.lineItems.map((item) => (
              <article key={item.itemNumber} className="rounded-[22px] border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Item #{item.itemNumber}</p>
                    <h4 className="mt-2 text-base font-semibold text-slate-900">{item.description}</h4>
                  </div>
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-[#0070b1]">
                    {item.material}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Qty</p>
                    <p className="mt-1 font-semibold text-slate-900">{item.quantity.toLocaleString("en-IN")} {item.unit}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Unit Price</p>
                    <p className="mt-1 font-semibold text-slate-900">{formatCurrency(item.price)}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#f8fafc] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Line Total</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                    {formatCurrency(item.quantity * item.price)}
                  </p>
                </div>
              </article>
            ))}

            <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Grand Total</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {formatCurrency(purchaseOrder.totalAmount)}
              </p>
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left">
              <thead className="bg-[#f8fafc] text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Item #</th>
                  <th className="px-6 py-4">Material</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Qty</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrder.lineItems.map((item, index) => (
                  <tr key={item.itemNumber} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                    <td className="px-6 py-4 font-semibold text-[#0070b1]">{item.itemNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{item.material}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{item.description}</td>
                    <td className="px-6 py-4 text-right text-slate-900">{item.quantity.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-slate-600">{item.unit}</td>
                    <td className="px-6 py-4 text-right text-slate-700">{formatCurrency(item.price)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-950">
                      {formatCurrency(item.quantity * item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#f8fafc]">
                <tr>
                  <td className="px-6 py-5 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500" colSpan="5">
                    Total ({purchaseOrder.lineItems.length} items)
                  </td>
                  <td className="px-6 py-5 text-right text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Grand Total
                  </td>
                  <td className="px-6 py-5 text-right text-3xl font-semibold tracking-tight text-slate-950">
                    {formatCurrency(purchaseOrder.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <PurchaseOrderAttachments
          poId={purchaseOrder.id}
          attachments={purchaseOrder.attachments ?? []}
          onAttachFiles={onAttachFiles}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,0.9fr)]">
          <ApprovalTimeline entries={purchaseOrder.approvalHistory} />
          <ApprovalDecision
            purchaseOrder={purchaseOrder}
            managerLimit={managerLimit}
            onApprove={onApprove}
            onReject={onReject}
          />
        </div>
      </div>
    </div>
  );
}
