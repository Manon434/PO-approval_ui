import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, CalendarDays, Paperclip, ShieldAlert, ShieldCheck, UploadCloud, X } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

const purchaseAreaOptions = [
  "PO01 - India Procurement",
  "PO02 - Energy Sourcing",
  "PO03 - IT Services",
  "PO05 - Capital Projects"
];

export default function NewPurchaseOrderModal({ open, managerLimit, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    supplierName: "",
    location: "",
    totalAmount: "",
    purchaseArea: purchaseAreaOptions[0],
    plant: "",
    deliveryDate: "",
    deliveryAddress: ""
  });
  const [attachments, setAttachments] = useState([]);
  const [showErrors, setShowErrors] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setFormData({
        supplierName: "",
        location: "",
        totalAmount: "",
        purchaseArea: purchaseAreaOptions[0],
        plant: "",
        deliveryDate: "",
        deliveryAddress: ""
      });
      setAttachments([]);
      setShowErrors(false);
    }
  }, [open]);

  const numericAmount = Number(formData.totalAmount || 0);
  const authorityRole = numericAmount > managerLimit ? "Director" : "Manager";
  const isValid =
    formData.supplierName.trim() &&
    formData.location.trim() &&
    numericAmount > 0 &&
    formData.purchaseArea &&
    formData.plant.trim() &&
    formData.deliveryDate &&
    formData.deliveryAddress.trim();

  const authorityLabel = useMemo(
    () =>
      numericAmount > 0
        ? `${authorityRole} will be notified automatically for this upload.`
        : "Enter the PO amount to preview the approval authority.",
    [authorityRole, numericAmount]
  );

  if (!open) {
    return null;
  }

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleSubmit() {
    if (!isValid) {
      setShowErrors(true);
      return;
    }

    onSubmit({
      ...formData,
      totalAmount: numericAmount,
      attachments
    });
  }

  function handleAttachmentsChange(event) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length > 0) {
      setAttachments((currentAttachments) => [...currentAttachments, ...selectedFiles]);
    }

    event.target.value = "";
  }

  function removeAttachment(indexToRemove) {
    setAttachments((currentAttachments) =>
      currentAttachments.filter((_, attachmentIndex) => attachmentIndex !== indexToRemove)
    );
  }

  function inputClasses(hasError) {
    return `w-full rounded-2xl border bg-white px-4 py-3 outline-none transition ${
      hasError
        ? "border-red-400 ring-2 ring-red-100"
        : "border-slate-300 focus:border-[#0070b1] focus:ring-2 focus:ring-sky-100"
    }`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-2 sm:p-4 backdrop-blur-sm">
      <div className="flex max-h-[95dvh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl shadow-slate-950/20 sm:rounded-[30px]">
        <div className="flex items-start justify-between bg-[#0070b1] px-4 py-4 text-white sm:px-6 sm:py-5">
          <div className="flex items-start gap-3">
            <UploadCloud className="mt-1 h-5 w-5" />
            <div>
              <h2 className="text-2xl font-semibold">Upload Purchase Order</h2>
              <p className="text-sm text-sky-100">New uploads trigger manager or director notifications automatically.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 transition hover:bg-white/10"
            aria-label="Close upload modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid flex-1 gap-5 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.9fr)]">
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Supplier Name
                </label>
                <input
                  value={formData.supplierName}
                  onChange={(event) => updateField("supplierName", event.target.value)}
                  placeholder="e.g. Bharat Forge Limited"
                  className={inputClasses(showErrors && !formData.supplierName.trim())}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Location
                </label>
                <input
                  value={formData.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="e.g. Pune, Maharashtra"
                  className={inputClasses(showErrors && !formData.location.trim())}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Total Amount (INR)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalAmount}
                  onChange={(event) => updateField("totalAmount", event.target.value)}
                  placeholder="500000"
                  className={inputClasses(showErrors && Number(formData.totalAmount || 0) <= 0)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Purchase Area
                </label>
                <select
                  value={formData.purchaseArea}
                  onChange={(event) => updateField("purchaseArea", event.target.value)}
                  className={inputClasses(false)}
                >
                  {purchaseAreaOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-600">Plant</label>
                <input
                  value={formData.plant}
                  onChange={(event) => updateField("plant", event.target.value)}
                  placeholder="e.g. PL07 - Pune Plant"
                  className={inputClasses(showErrors && !formData.plant.trim())}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(event) => updateField("deliveryDate", event.target.value)}
                  className={inputClasses(showErrors && !formData.deliveryDate)}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-600">
                Delivery Address
              </label>
              <textarea
                rows={4}
                value={formData.deliveryAddress}
                onChange={(event) => updateField("deliveryAddress", event.target.value)}
                placeholder="Enter the delivery destination for the plant or warehouse."
                className={inputClasses(showErrors && !formData.deliveryAddress.trim())}
              />
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-[#0070b1]" />
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Attachments</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Attach the full PO PDF, tickets, quotations, or any supporting files to notify the approver with
                    complete context.
                  </p>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv,.txt"
                    className="hidden"
                    onChange={handleAttachmentsChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
                  >
                    <Paperclip className="h-4 w-4" />
                    Add files
                  </button>
                </div>
              </div>

              {attachments.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={`${attachment.name}-${index}`}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{attachment.name}</p>
                        <p className="text-sm text-slate-500">
                          {attachment.type || "Document"} | {(attachment.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-slate-200 bg-[#f4f6f8] p-5">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#0070b1]" />
              <h3 className="text-lg font-semibold text-slate-900">Routing Preview</h3>
            </div>

            <div className="rounded-2xl bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Upload Value</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {numericAmount > 0 ? formatCurrency(numericAmount) : formatCurrency(0)}
              </p>
            </div>

            <div
              className={`rounded-2xl border px-4 py-4 ${
                authorityRole === "Manager"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              <div className="flex items-start gap-3">
                {authorityRole === "Manager" ? (
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                ) : (
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
                )}
                <div>
                  <p className="font-semibold">{authorityRole} Notification</p>
                  <p className="mt-1 text-sm leading-6">{authorityLabel}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
              <div className="flex items-center gap-2 font-semibold uppercase tracking-[0.14em] text-slate-400">
                <CalendarDays className="h-4 w-4 text-[#0070b1]" />
                Workflow
              </div>
              <p className="mt-3 leading-6">
                After upload, the PO is added to the queue and the assigned authority receives an immediate in-app
                notification.
              </p>
            </div>
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
            className="rounded-2xl bg-[#0070b1] px-5 py-3 font-semibold text-white transition hover:bg-[#005d91]"
          >
            Upload PO
          </button>
        </div>
      </div>
    </div>
  );
}
