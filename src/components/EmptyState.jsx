import { FileSearch } from "lucide-react";

export default function EmptyState({ activeSection, hasOrders }) {
  const isApprovedSection = activeSection === "approved";

  return (
    <div className="flex h-full min-h-[400px] items-center justify-center p-10">
      <div className="max-w-md rounded-[32px] border border-slate-200 bg-white/80 px-10 py-12 text-center shadow-panel backdrop-blur">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-sky-50 text-[#0070b1]">
          <FileSearch className="h-11 w-11" />
        </div>
        <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
          {hasOrders ? `Select a ${isApprovedSection ? "Approved" : "Pending"} Purchase Order` : "All approvals are complete"}
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-500">
          {hasOrders
            ? `Choose a PO from the ${isApprovedSection ? "approved" : "pending"} list to review vendor details, line items, attachments, and approval history.`
            : `There are no purchase orders in the selected ${isApprovedSection ? "approved" : "pending"} director queue right now.`}
        </p>
      </div>
    </div>
  );
}
