import { loadPersistedAuth } from "../types/auth";

const DEFAULT_BASE = "http://localhost:8000";

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? DEFAULT_BASE;
}

type FetchOptions = RequestInit & { skipAuth?: boolean };

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const { skipAuth, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (!headers.has("Content-Type") && rest.body && !(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const auth = loadPersistedAuth();
    if (auth?.accessToken) {
      headers.set("Authorization", `Bearer ${auth.accessToken}`);
    }
  }

  const url = path.startsWith("http") ? path : `${getApiBaseUrl()}${path}`;
  return fetch(url, { ...rest, headers });
}
