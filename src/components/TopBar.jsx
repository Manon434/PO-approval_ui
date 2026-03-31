import { Bell, CircleHelp, Menu, Settings, ShoppingCart, Upload, UserRound } from "lucide-react";

export default function TopBar({
  pendingCount,
  unreadNotifications,
  notificationsOpen,
  onMenuOpen,
  onToggleNotifications,
  onOpenUpload,
  currentDateLabel
}) {
  return (
    <header className="flex min-h-[72px] items-center justify-between gap-3 bg-[#0070b1] px-3 py-3 text-white shadow-lg shadow-sky-900/20 sm:px-4 md:px-5">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="rounded-xl border border-white/20 bg-white/10 p-2 transition hover:bg-white/15 xl:hidden"
          aria-label="Open purchase order list"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 sm:h-10 sm:w-10">
          <ShoppingCart className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xl font-semibold tracking-tight sm:text-2xl">SAP</span>
            <span className="hidden h-6 w-px bg-white/30 sm:block" />
            <span className="text-sm font-medium sm:text-lg">Purchase Order Approval</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-sky-100 sm:gap-3 sm:text-sm">
            <p>{pendingCount} pending approvals</p>
            <span className="hidden h-4 w-px bg-white/20 sm:block" />
            <p className="hidden sm:block">{currentDateLabel}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
        <button
          type="button"
          onClick={onOpenUpload}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-[#0070b1] transition hover:bg-sky-50 sm:px-4 sm:py-2.5"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Upload PO</span>
        </button>

        <div className="hidden items-center gap-3 md:flex">
          {[CircleHelp, Settings].map((Icon, index) => (
            <button
              key={index}
              type="button"
              className="rounded-full border border-white/20 bg-white/5 p-2 transition hover:bg-white/15"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggleNotifications}
          className={`relative rounded-full border p-2 transition ${
            notificationsOpen
              ? "border-white/40 bg-white/20"
              : "border-white/20 bg-white/5 hover:bg-white/15"
          }`}
          aria-label="Open authority notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadNotifications > 0 ? (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-slate-900">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          ) : null}
        </button>

        <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-2 py-2 sm:gap-3 sm:px-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 sm:h-10 sm:w-10">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="hidden text-right sm:block">
            <div className="text-sm font-semibold">Arjun Mehta</div>
            <div className="text-xs text-sky-100">Manager</div>
          </div>
        </div>
      </div>
    </header>
  );
}
