const syncState = {
  status: "idle",
  enabled: false,
  lastRunAt: null,
  lastSuccessAt: null,
  lastError: null,
  lastSummary: []
};

export function markSyncDisabled(reason) {
  syncState.enabled = false;
  syncState.status = "disabled";
  syncState.lastError = reason;
}

export function markSyncStarted() {
  syncState.enabled = true;
  syncState.status = "running";
  syncState.lastRunAt = new Date().toISOString();
  syncState.lastError = null;
}

export function markSyncSucceeded(summary) {
  syncState.enabled = true;
  syncState.status = "success";
  syncState.lastRunAt = new Date().toISOString();
  syncState.lastSuccessAt = syncState.lastRunAt;
  syncState.lastSummary = summary;
  syncState.lastError = null;
}

export function markSyncFailed(errorMessage) {
  syncState.enabled = true;
  syncState.status = "error";
  syncState.lastRunAt = new Date().toISOString();
  syncState.lastError = errorMessage;
}

export function getSyncState() {
  return {
    ...syncState
  };
}
