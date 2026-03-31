import { NavLink } from "react-router-dom";
import { CheckCircle2, ChevronRight, Clock3, FileText, X, XCircle } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/formatters";

function StatusBadge({ status }) {
  const isApproved = status === "Approved";
  const isRejected = status === "Rejected";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${
        isApproved
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : isRejected
            ? "border-red-300 bg-red-50 text-red-700"
            : "border-amber-300 bg-amber-50 text-amber-700"
      }`}
    >
      {isApproved ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : isRejected ? (
        <XCircle className="h-3.5 w-3.5" />
      ) : (
        <Clock3 className="h-3.5 w-3.5" />
      )}
      {status}
    </span>
  );
}

function SummaryTile({ label, value, tone }) {
  const styles = {
    neutral: "border-slate-200 bg-white text-slate-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800"
  };

  return (
    <div className={`rounded-2xl border px-3 py-3 ${styles[tone] ?? styles.neutral}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

export default function Sidebar({
  orders,
  activeSection,
  pendingCount,
  approvedCount,
  rejectedCount,
  onSectionChange,
  open,
  onClose
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/30 transition xl:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(100vw,380px)] max-w-full flex-col border-r border-slate-200 bg-white/95 backdrop-blur transition duration-300 xl:static xl:h-full xl:w-[380px] xl:max-w-[380px] xl:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-slate-200 bg-[#f8fafc] px-4 py-5 sm:px-5 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Director Workspace</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Purchase Orders</h1>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 xl:hidden"
              aria-label="Close purchase order list"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            <SummaryTile label="Pending" value={pendingCount} tone="warning" />
            <SummaryTile label="Approved" value={approvedCount} tone="success" />
            <SummaryTile label="Rejected" value={rejectedCount} tone="neutral" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 rounded-[24px] bg-white p-1">
            {[
              { key: "pending", label: "Pending", count: pendingCount },
              { key: "approved", label: "Approved", count: approvedCount },
              { key: "rejected", label: "Rejected", count: rejectedCount }
            ].map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => onSectionChange(section.key)}
                className={`rounded-[20px] px-4 py-3 text-left transition ${
                  activeSection === section.key
                    ? "bg-[#0070b1] text-white shadow-lg shadow-sky-200"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] opacity-70 sm:text-xs sm:tracking-[0.16em]">
                  {section.label}
                </p>
                <p className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">{section.count}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {orders.length === 0 ? (
            <div className="px-4 py-8 text-sm leading-6 text-slate-500 sm:px-5">
              {activeSection === "pending"
                ? "There are no pending purchase orders to review."
                : activeSection === "approved"
                  ? "There are no approved purchase orders yet."
                  : "There are no rejected purchase orders yet."}
            </div>
          ) : (
            orders.map((order) => (
              <NavLink
                key={order.id}
                to={`/po/${order.id}`}
                onClick={onClose}
                className={({ isActive }) =>
                  `group block border-b border-slate-100 px-4 py-4 transition sm:px-5 sm:py-5 ${
                    isActive ? "bg-sky-50" : "hover:bg-slate-100/90"
                  }`
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0070b1]">
                      <FileText className="h-4 w-4" />
                      {order.poNumber}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{order.supplierName}</h2>
                      <p className="text-sm text-slate-500">{order.location}</p>
                    </div>
                    <div className="text-[26px] font-semibold leading-none tracking-tight text-slate-950 sm:text-[30px]">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <StatusBadge status={order.status} />
                      <span className="text-xs text-slate-400">{formatDate(order.orderDetails.createdDate)}</span>
                    </div>
                  </div>

                  <ChevronRight className="mt-2 h-4 w-4 text-slate-400 transition group-hover:text-slate-600" />
                </div>
              </NavLink>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
