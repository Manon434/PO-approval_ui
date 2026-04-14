import { AlertTriangle, CheckCircle2, Fingerprint, ShieldCheck, ShieldOff } from "lucide-react";
import { formatDateTime } from "../utils/formatters";

function SecurityMetric({ label, value, tone = "neutral" }) {
  const tones = {
    neutral: "border-slate-200 bg-white text-slate-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800"
  };

  return (
    <div className={`rounded-2xl border px-4 py-4 ${tones[tone] ?? tones.neutral}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

export default function SecurityStatusPanel({ currentUser, securityMode, suspiciousEvents }) {
  const secureModeActive = securityMode === "secure";
  const latestSuspiciousEvent = suspiciousEvents[0] ?? null;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-panel sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {secureModeActive ? (
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            ) : (
              <ShieldOff className="h-5 w-5 text-amber-600" />
            )}
            <h3 className="text-lg font-semibold text-slate-900">Security Status</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {secureModeActive
              ? "Protected session mode is active. Requests are authenticated, audited, and monitored for unusual activity."
              : "Demo mode is active. Backend security services are not currently enforcing authenticated access."}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold ${
            secureModeActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          {secureModeActive ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {secureModeActive ? "Secure Mode Active" : "Demo Mode"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <SecurityMetric label="Session User" value={currentUser?.name ?? "Guest"} tone={secureModeActive ? "success" : "warning"} />
        <SecurityMetric label="Role" value={currentUser?.role ?? "Not signed in"} tone="neutral" />
        <SecurityMetric label="Suspicious Events" value={String(suspiciousEvents.length)} tone={suspiciousEvents.length > 0 ? "warning" : "success"} />
      </div>

      <div className="mt-5 rounded-[24px] border border-slate-200 bg-[#f8fafc] p-4">
        <div className="flex items-center gap-2">
          <Fingerprint className="h-4 w-4 text-[#0070b1]" />
          <p className="text-sm font-semibold text-slate-900">Latest Security Insight</p>
        </div>

        {latestSuspiciousEvent ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-slate-900">{latestSuspiciousEvent.message}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>{latestSuspiciousEvent.deviceLabel ?? "Unknown device"}</span>
              <span>{latestSuspiciousEvent.ip ?? "Unknown IP"}</span>
              <span>{formatDateTime(latestSuspiciousEvent.createdAt ?? new Date().toISOString())}</span>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-slate-500">
            No suspicious activity has been detected recently. Login attempts, device changes, and API access are being monitored.
          </p>
        )}
      </div>
    </section>
  );
}
