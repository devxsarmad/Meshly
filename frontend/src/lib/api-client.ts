import { apiUrl, getAccessToken, refreshSession } from './api';

let refreshInFlight: Promise<unknown> | null = null;

/*
 * Access tokens are short-lived and attached to every API request. When the
 * gateway returns 401, one refresh request rotates the refresh token pair;
 * the original request is then retried once. If refresh fails, the caller
 * receives the auth error and can send the user back to sign-in.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const accessToken = getAccessToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(`${apiUrl}${path}`, { ...init, headers });
  if (response.status === 401 && retry && getAccessToken()) {
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
