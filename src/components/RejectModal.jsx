import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";

export default function RejectModal({ open, poNumber, reasons, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!open) {
      setReason("");
      setComments("");
      setShowErrors(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const reasonError = showErrors && !reason;
  const commentsError = showErrors && !comments.trim();

  function handleSubmit() {
    if (!reason || !comments.trim()) {
      setShowErrors(true);
      return;
    }

    onConfirm({
      reason,
      comments: comments.trim()
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-2 sm:p-4 backdrop-blur-sm">
      <div className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl shadow-slate-950/25 sm:rounded-[28px]">
        <div className="flex items-start justify-between bg-red-600 px-4 py-4 text-white sm:px-6 sm:py-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-1 h-5 w-5" />
            <div>
              <h2 className="text-2xl font-semibold">Reject Purchase Order</h2>
              <p className="text-sm text-red-50">PO #{poNumber}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 transition hover:bg-white/10"
            aria-label="Close rejection modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-600">
              Rejection Reason <span className="text-red-600">*</span>
            </label>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className={`w-full rounded-2xl border bg-white px-4 py-3 outline-none transition ${
                reasonError
                  ? "border-red-400 ring-2 ring-red-100"
                  : "border-slate-300 focus:border-[#0070b1] focus:ring-2 focus:ring-sky-100"
              }`}
            >
              <option value="">-- Select a reason --</option>
              {reasons.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {reasonError ? <p className="mt-2 text-sm text-red-600">Please select a rejection reason.</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-600">
              Director Comments <span className="text-red-600">*</span>
            </label>
            <textarea
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              rows={5}
              placeholder="Provide detailed justification for the rejection. This will be sent to the requestor."
              className={`w-full rounded-2xl border bg-white px-4 py-3 outline-none transition ${
                commentsError
                  ? "border-red-400 ring-2 ring-red-100"
                  : "border-slate-300 focus:border-[#0070b1] focus:ring-2 focus:ring-sky-100"
              }`}
            />
            <div className="mt-2 flex items-center justify-between">
              {commentsError ? <p className="text-sm text-red-600">Director comments are required.</p> : <span />}
              <p className="text-sm text-slate-400">{comments.length} chars</p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
            <span className="font-semibold">Note:</span> This action will immediately notify the requestor and update
            the PO status to <span className="italic">Rejected</span>. This cannot be undone.
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}
