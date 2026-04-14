import { Settings, X } from "lucide-react";

const intervalOptions = [
  { value: 5, label: "Every 5 minutes" },
  { value: 10, label: "Every 10 minutes" },
  { value: 15, label: "Every 15 minutes" },
  { value: 30, label: "Every 30 minutes" }
];

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <span>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="absolute inset-0 rounded-full bg-slate-200 transition peer-checked:bg-sky-500" />
        <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export default function SettingsPanel({ open, settings, onChange, onClose, onRefreshNow }) {
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
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#0070b1]" />
              <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              aria-label="Close settings"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Control how often the app refreshes and when authority notifications should appear.
          </p>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <Toggle
            label="Auto-refresh from backend"
            description="Pull live SAP-backed updates automatically to keep the approval queue current."
            checked={settings.autoRefresh}
            onChange={(value) => onChange({ ...settings, autoRefresh: value })}
          />

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">Refresh interval</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Choose how often the app should pull fresh data when auto-refresh is on.
            </p>
            <select
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              value={settings.refreshInterval}
              onChange={(event) => onChange({ ...settings, refreshInterval: Number(event.target.value) })}
              disabled={!settings.autoRefresh}
            >
              {intervalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onRefreshNow}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Refresh now
            </button>
          </div>

          <Toggle
            label="Notify only for pending POs"
            description="Only raise new alerts for purchase orders that require approval."
            checked={settings.notifyPendingOnly}
            onChange={(value) => onChange({ ...settings, notifyPendingOnly: value })}
          />

          <Toggle
            label="Mark notifications read when opened"
            description="Automatically clear unread badges when the notification drawer is opened."
            checked={settings.autoReadNotifications}
            onChange={(value) => onChange({ ...settings, autoReadNotifications: value })}
          />

          <Toggle
            label="Play sound for new POs"
            description="Play a short alert tone when new purchase orders arrive."
            checked={settings.playSound}
            onChange={(value) => onChange({ ...settings, playSound: value })}
          />
        </div>
      </aside>
    </div>
  );
}
