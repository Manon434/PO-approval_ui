import { BellRing, CheckCheck, ChevronRight, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { formatCurrency, formatDateTime } from "../utils/formatters";

function RecipientBadge({ role }) {
  const isManager = role === "Manager";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${
        isManager
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-amber-300 bg-amber-50 text-amber-700"
      }`}
    >
      {isManager ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
      {role}
    </span>
  );
}

export default function NotificationCenter({
  open,
  notifications,
  unreadCount,
  onClose,
  onMarkAllRead,
  onOpenOrder
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/20 backdrop-blur-[1px]" onClick={onClose}>
      <aside
        className="h-full w-full max-w-full overflow-y-auto border-l border-slate-200 bg-white shadow-2xl shadow-slate-950/20 sm:max-w-[420px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-[#0070b1]" />
                <h2 className="text-xl font-semibold text-slate-900">Authority Notifications</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {unreadCount} unread alerts for manager and director approval routing.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onMarkAllRead}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {notifications.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-500">
              No workflow notifications yet. New purchase order uploads will notify the correct authority here.
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => onOpenOrder(notification.id, notification.poId)}
                className={`w-full rounded-[24px] border px-4 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                  notification.unread
                    ? "border-sky-200 bg-sky-50/60 shadow-sm shadow-sky-100"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <RecipientBadge role={notification.recipientRole} />
                      {notification.unread ? <span className="h-2 w-2 rounded-full bg-[#0070b1]" /> : null}
                    </div>
                    <p className="mt-3 text-base font-semibold text-slate-900">
                      {notification.recipientName} notified for PO {notification.poNumber}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{notification.message}</p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                </div>

                <div className="mt-4 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <span className="font-medium text-slate-700">{notification.supplierName}</span>
                  <span>{formatCurrency(notification.amount)}</span>
                  <span>{formatDateTime(notification.createdAt)}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
