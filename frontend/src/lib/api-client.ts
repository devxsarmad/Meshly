import { apiUrl, refreshSession } from './api';

let refreshInFlight: Promise<unknown> | null = null;

/*
 * The browser sends the HttpOnly access cookie automatically. When the
 * gateway returns 401, one refresh request rotates the cookie pair; the
 * original request is then retried once. JavaScript never reads either token.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${apiUrl}${path}`, { ...init, credentials: 'include', headers });
  if (response.status === 401 && retry) {
    refreshInFlight ||= refreshSession();
    try {
      await refreshInFlight;
    } finally {
      refreshInFlight = null;
    }
    return apiFetch<T>(path, init, false);
  }

  const payload = await response.json().catch(() => ({})) as { success?: boolean; message?: string; data?: T };
  if (!response.ok) throw new Error(payload.message || 'The request could not be completed.');
  return payload.data as T;
}
