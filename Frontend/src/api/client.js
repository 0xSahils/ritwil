const API_BASE_URL = "/api";

function getStoredAccessToken() {
  return localStorage.getItem("accessToken");
}

function setStoredAccessToken(token) {
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
}

async function refreshAccessToken() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    setStoredAccessToken(null);
    throw new Error("Unable to refresh session");
  }

  const data = await response.json();
  setStoredAccessToken(data.accessToken);
  return data.accessToken;
}

export async function apiRequest(path, options = {}, { skipAuth } = {}) {
  const url = `${API_BASE_URL}${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  let token = getStoredAccessToken();

  if (!skipAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const initialResponse = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (initialResponse.status !== 401 || skipAuth) {
    return initialResponse;
  }

  try {
    token = await refreshAccessToken();
  } catch {
    // Dispatch session expired event so AuthContext can handle it (logout + message)
    window.dispatchEvent(new CustomEvent("auth:session-expired"));
    return initialResponse;
  }

  const retryHeaders = {
    ...headers,
    Authorization: `Bearer ${token}`,
  };

  return fetch(url, {
    ...options,
    headers: retryHeaders,
    credentials: "include",
  });
}

export function clearAuthStorage() {
  setStoredAccessToken(null);
}

export function storeAccessToken(token) {
  setStoredAccessToken(token);
}

export { API_BASE_URL };

