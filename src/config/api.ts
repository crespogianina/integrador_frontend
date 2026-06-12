export const API_BASE = "http://localhost:8000/api/v1";

type LogoutFn = () => void;
let _logout: LogoutFn | null = null;

export function registerLogout(fn: LogoutFn) {
  _logout = fn;
}

export async function apiFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const res = await fetch(url, {
    credentials: "include",
    ...options,
  });

  if (res.status === 401) {
    _logout?.();
  }

  return res;
}