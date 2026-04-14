import { AlertTriangle, ServerCrash, ShieldAlert } from "lucide-react";
import { formatDateTime } from "../utils/formatters";

function AlertCard({ title, message, tone = "warning", detail }) {
  const styles = {
    danger: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-sky-200 bg-sky-50 text-sky-800"
  };

  const Icon = tone === "danger" ? ServerCrash : tone === "warning" ? ShieldAlert : AlertTriangle;

  return (
    <div className={`rounded-[24px] border px-4 py-4 ${styles[tone] ?? styles.warning}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6">{message}</p>
          {detail ? <p className="mt-2 text-xs opacity-80">{detail}</p> : null}
        </div>
      </div>
    </div>
  );
}

export default function SystemAlerts({ backendDisconnected, systemStatus }) {
  const alerts = [];

  if (backendDisconnected) {
    alerts.push(
      <AlertCard
        key="backend"
        title="Backend disconnected"
        message="The frontend cannot reach the backend right now. Authentication, protected APIs, and live status checks are unavailable."
        detail="Make sure npm run dev:server is still running on localhost:4000."
        tone="danger"
      />
    );
  }

  const syncState = systemStatus?.sap?.sync;
  const syncError = syncState?.lastError ?? "";
  const invalidSapCredentials = syncState?.status === "error" && /401|unauthorized|status code 401/i.test(syncError);

  if (invalidSapCredentials) {
    alerts.push(
      <AlertCard
        key="sap-credentials"
        title="SAP credentials invalid"
        message="The backend is running, but SAP rejected the sync request. Update SAP_USER and SAP_PASS in .env and restart the backend."
        detail={syncState?.lastRunAt ? `Last failed sync: ${formatDateTime(syncState.lastRunAt)}` : syncError}
        tone="warning"
      />
    );
  } else if (syncState?.status === "error" && syncError) {
    alerts.push(
      <AlertCard
        key="sap-sync"
        title="SAP sync issue detected"
        message="The backend could not complete the latest SAP sync run."
        detail={syncState?.lastRunAt ? `${syncError} | ${formatDateTime(syncState.lastRunAt)}` : syncError}
        tone="warning"
      />
    );
  }

  if (alerts.length === 0) {
    return null;
  }

  return <div className="space-y-3">{alerts}</div>;
}
