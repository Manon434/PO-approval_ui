import { CheckCircle2, Clock3, FileText, Send, XCircle } from "lucide-react";
import { formatDateTime } from "../utils/formatters";

const iconStyles = {
  created: {
    icon: FileText,
    ring: "ring-slate-200",
    bg: "bg-slate-50",
    text: "text-slate-500"
  },
  submitted: {
    icon: Send,
    ring: "ring-sky-200",
    bg: "bg-sky-50",
    text: "text-[#0070b1]"
  },
  approved: {
    icon: CheckCircle2,
    ring: "ring-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-600"
  },
  rejected: {
    icon: XCircle,
    ring: "ring-red-200",
    bg: "bg-red-50",
    text: "text-red-600"
  }
};

export default function ApprovalTimeline({ entries }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-[#f4f6f8] p-6 shadow-panel">
      <div className="flex items-center gap-2">
        <Clock3 className="h-5 w-5 text-[#0070b1]" />
        <h3 className="text-lg font-semibold text-slate-900">Approval History</h3>
      </div>

      <div className="relative mt-6 space-y-6 pl-4">
        <div className="absolute bottom-1 left-[17px] top-1 w-px bg-slate-200" />
        {entries.map((entry) => {
          const style = iconStyles[entry.type] ?? iconStyles.created;
          const Icon = style.icon;

          return (
            <div key={entry.id} className="relative pl-11">
              <div
                className={`absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full ring-4 ${style.bg} ${style.ring}`}
              >
                <Icon className={`h-4 w-4 ${style.text}`} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span className={`text-lg font-semibold ${style.text}`}>{entry.title}</span>
                  <span>&bull;</span>
                  <span>{formatDateTime(entry.time)}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {entry.actor} <span className="font-normal text-slate-500">- {entry.role}</span>
                </p>
                {entry.note ? (
                  <p className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm italic leading-6 text-slate-600">
                    "{entry.note}"
                  </p>
                ) : null}
                {entry.reason ? (
                  <p className="mt-3 text-sm font-medium text-red-700">
                    Reason: <span className="font-normal">{entry.reason}</span>
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
