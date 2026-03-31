import { useRef } from "react";
import { Download, FileImage, FileSpreadsheet, FileText, Paperclip, UploadCloud } from "lucide-react";
import { formatDateTime } from "../utils/formatters";

function formatFileSize(bytes = 0) {
  if (!bytes) {
    return "Uploaded document";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getAttachmentVisual(attachment) {
  const extension = attachment.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = attachment.mimeType ?? "";

  if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp"].includes(extension)) {
    return {
      icon: FileImage,
      badge: "Image",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-700"
    };
  }

  if (mimeType.includes("sheet") || ["xls", "xlsx", "csv"].includes(extension)) {
    return {
      icon: FileSpreadsheet,
      badge: "Sheet",
      tone: "border-amber-200 bg-amber-50 text-amber-700"
    };
  }

  if (mimeType === "application/pdf" || extension === "pdf") {
    return {
      icon: FileText,
      badge: "PDF",
      tone: "border-sky-200 bg-sky-50 text-sky-700"
    };
  }

  return {
    icon: FileText,
    badge: "Doc",
    tone: "border-slate-200 bg-slate-100 text-slate-700"
  };
}

export default function PurchaseOrderAttachments({ poId, attachments, onAttachFiles }) {
  const fileInputRef = useRef(null);

  function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length > 0) {
      onAttachFiles(poId, selectedFiles);
    }

    event.target.value = "";
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Paperclip className="h-5 w-5 text-[#0070b1]" />
            <h3 className="text-lg font-semibold text-slate-900">Attachments</h3>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Attach the full PO PDF, vendor quotes, tickets, approval notes, or other supporting documents for this
            purchase order.
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0070b1] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#005d91]"
          >
            <UploadCloud className="h-4 w-4" />
            Add attachments
          </button>
        </div>
      </div>

      {attachments.length === 0 ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
          <p className="text-base font-semibold text-slate-700">No attachments uploaded yet</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Upload documents here so the manager, director, or higher authority can review the full PO package.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {attachments.map((attachment) => {
            const visual = getAttachmentVisual(attachment);
            const Icon = visual.icon;

            return (
              <div key={attachment.id} className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0070b1] shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-slate-900">{attachment.name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${visual.tone}`}>
                          {visual.badge}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">
                          {attachment.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {attachment.url ? (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Download className="h-4 w-4" />
                      Open
                    </a>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span>{formatFileSize(attachment.size)}</span>
                  <span>{formatDateTime(attachment.uploadedAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
