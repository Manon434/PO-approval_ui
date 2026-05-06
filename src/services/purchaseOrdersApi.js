const API_BASE = import.meta.env.VITE_API_URL ?? "";
let accessToken = "";

try {
  accessToken = window.sessionStorage.getItem("pop-access-token") ?? "";
} catch {
  accessToken = "";
}

function buildApiUrl(path) {
  if (!API_BASE) {
    return path;
  }

  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const nextPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${nextPath}`;
}

async function requestJson(path, options = {}) {
  const headers = {
    ...(options.headers ?? {})
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(buildApiUrl(path), {
    credentials: "include",
    ...options,
    headers
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

export function setAccessToken(token) {
  accessToken = token ?? "";
  try {
    if (accessToken) {
      window.sessionStorage.setItem("pop-access-token", accessToken);
    } else {
      window.sessionStorage.removeItem("pop-access-token");
    }
  } catch {
    // Ignore storage issues.
  }
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

export function syncPurchaseOrdersFromSapInApi() {
  return requestJson("/api/admin/sync", {
    method: "POST"
  });
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

export function fetchDemoAccessFromApi() {
  return requestJson("/api/auth/demo-access");
}

export function updateDemoAccessInApi(enabled) {
  return requestJson("/api/auth/demo-access", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ enabled })
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
