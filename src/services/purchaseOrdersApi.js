async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    ...options
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorPayload = await response.json();
      message = errorPayload.error ?? message;
    } catch {
      // Ignore JSON parsing issues for non-JSON responses.
    }

    throw new Error(message);
  }

  return response.json();
}

export function isBackendUnavailable(error) {
  return error instanceof TypeError || /failed to fetch/i.test(error.message);
}

export function isUnauthorizedError(error) {
  return /authentication required|status 401|invalid email or password/i.test(error.message);
}

export function fetchPurchaseOrdersFromApi() {
  return requestJson("/api/po");
}

export function fetchSystemStatusFromApi() {
  return requestJson("/api/health");
}

export function fetchCurrentUserFromApi() {
  return requestJson("/api/auth/me");
}

export function loginInApi(payload) {
  return requestJson("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function logoutFromApi() {
  return requestJson("/api/auth/logout", {
    method: "POST"
  });
}

export function fetchSuspiciousActivityFromApi() {
  return requestJson("/api/security/suspicious");
}

export function fetchSecurityEventsFromApi() {
  return requestJson("/api/security/events");
}

export function approvePurchaseOrderInApi(poNumber, payload) {
  return requestJson(`/api/po/${poNumber}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function rejectPurchaseOrderInApi(poNumber, payload) {
  return requestJson(`/api/po/${poNumber}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}


