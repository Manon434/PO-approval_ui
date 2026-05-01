import { Bell, CircleHelp, LogOut, Menu, Settings, ShieldCheck, ShieldOff, ShoppingCart, Upload, UserRound } from "lucide-react";

export default function TopBar({
  pendingCount,
  unreadNotifications,
  notificationsOpen,
  onMenuOpen,
  onToggleNotifications,
  onOpenSettings,
  onOpenUpload,
  currentDateLabel,
  currentUser,
  onLogout,
  showUpload = true,
  securityMode = "secure"
}) {
  const secureModeActive = securityMode === "secure";

  return (
    <header className="flex min-h-[72px] flex-wrap items-start justify-between gap-3 bg-[#0070b1] px-3 py-3 text-white shadow-lg shadow-sky-900/20 sm:flex-nowrap sm:items-center sm:px-4 md:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
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
            <span className="text-xl font-semibold tracking-tight sm:text-2xl">POP</span>
            <span className="hidden h-6 w-px bg-white/30 sm:block" />
            <span className="text-sm font-medium leading-5 sm:text-lg">Purchase Order Approval</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${
                secureModeActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              {secureModeActive ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
              {secureModeActive ? "Secure" : "Demo"}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-sky-100 sm:gap-3 sm:text-sm">
            <p>{pendingCount} pending approvals</p>
            <span className="hidden h-4 w-px bg-white/20 sm:block" />
            <p className="hidden sm:block">{currentDateLabel}</p>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 self-start sm:self-center sm:gap-3 md:gap-4">
        {showUpload ? (
          <button
            type="button"
            onClick={onOpenUpload}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#0070b1] transition hover:bg-sky-50 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm sm:font-semibold"
            aria-label="Upload purchase order"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload PO</span>
          </button>
        ) : null}

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            className="hidden rounded-full border border-white/20 bg-white/5 p-2 transition hover:bg-white/15 md:inline-flex"
            aria-label="Help"
          >
            <CircleHelp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-full border border-white/20 bg-white/5 p-2 transition hover:bg-white/15"
            aria-label="Open settings"
          >
            <Settings className="h-4 w-4" />
          </button>
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
            <div className="text-sm font-semibold">{currentUser?.name ?? "Ananya Rao"}</div>
            <div className="text-xs text-sky-100">{currentUser?.role ?? "Director"}</div>
          </div>
        </div>

        {onLogout ? (
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 transition hover:bg-white/15"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </header>
  );
}
