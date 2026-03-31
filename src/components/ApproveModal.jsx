import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

export default function ApproveModal({ open, poNumber, onClose, onConfirm }) {
  const [comments, setComments] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!open) {
      setComments("");
      setConfirmed(false);
      setShowErrors(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const commentsError = showErrors && !comments.trim();
  const confirmationError = showErrors && !confirmed;

  function handleSubmit() {
    if (!comments.trim() || !confirmed) {
      setShowErrors(true);
      return;
    }

    onConfirm({
      comments: comments.trim()
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-2 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl shadow-slate-950/25 sm:rounded-[28px]">
        <div className="flex items-start justify-between bg-emerald-600 px-4 py-4 text-white sm:px-6 sm:py-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5" />
            <div>
              <h2 className="text-2xl font-semibold">Approve Purchase Order</h2>
              <p className="text-sm text-emerald-50">PO #{poNumber}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 transition hover:bg-white/10"
            aria-label="Close approval modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-600">
              Director Comments <span className="text-emerald-600">*</span>
            </label>
            <textarea
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              rows={5}
              placeholder="Add approval notes or business justification. These comments will be saved in the approval history."
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

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition ${
              confirmationError
                ? "border-red-300 bg-red-50"
                : confirmed
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
            }`}
          >
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-200"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">Confirm approval decision</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                I confirm that this purchase order has been reviewed and should move to the approved queue.
              </p>
              {confirmationError ? <p className="mt-2 text-sm text-red-600">Please confirm before approving.</p> : null}
            </div>
          </label>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
            <span className="font-semibold">Note:</span> This action will update the PO status to <span className="italic">Approved</span> and store the director comments in the approval history.
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
            className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            Confirm Approval
          </button>
        </div>
      </div>
    </div>
  );
}
