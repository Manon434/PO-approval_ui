import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const toastStyles = {
  success: {
    icon: CheckCircle2,
    accent: "border-emerald-200 bg-emerald-50 text-emerald-900",
    iconColor: "text-emerald-600"
  },
  warning: {
    icon: AlertTriangle,
    accent: "border-amber-200 bg-amber-50 text-amber-900",
    iconColor: "text-amber-600"
  },
  error: {
    icon: XCircle,
    accent: "border-red-200 bg-red-50 text-red-900",
    iconColor: "text-red-600"
  }
};

export default function ToastRegion({ toasts }) {
  return (
    <div className="pointer-events-none fixed right-4 top-24 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => {
        const style = toastStyles[toast.type] ?? toastStyles.success;
        const Icon = style.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-4 shadow-xl shadow-slate-900/10 backdrop-blur ${style.accent}`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconColor}`} />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{toast.title}</p>
                <p className="mt-1 text-sm leading-6 opacity-80">{toast.message}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
