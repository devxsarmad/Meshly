export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inventoryCount: number;
  imageUrl?: string;
  isActive: boolean;
};

type ProductResponse = { success: boolean; data: Product[] };
type SingleProductResponse = { success: boolean; data: Product };

export const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function getProducts(filters?: { search?: string; category?: string }) {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.category && filters.category !== 'All') params.set('category', filters.category);
  const query = params.toString();
  const response = await fetch(`${apiUrl}/api/products${query ? `?${query}` : ''}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load the catalog right now.');
  const payload = await response.json() as ProductResponse;
  return payload.data;
}

export async function getProduct(id: string) {
  const response = await fetch(`${apiUrl}/api/products/${id}`, { cache: 'no-store' });
  if (response.status === 404) throw new Error('Product not found.');
  if (!response.ok) throw new Error('Unable to load this product right now.');
  const payload = await response.json() as SingleProductResponse;
  return payload.data;
}

export type AuthUser = { id: string; email: string; name: string | null; role: string };
export type AuthSession = { user: AuthUser; tokens: { accessToken: string; refreshToken: string } };

async function authRequest(path: string, body: Record<string, string>) {
  const response = await fetch(`${apiUrl}/api/auth/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const payload = await response.json() as { success: boolean; message?: string; data?: AuthSession };
  if (!response.ok || !payload.data) throw new Error(payload.message || 'Authentication request failed.');
  return payload.data;
}

export function signIn(email: string, password: string) { return authRequest('login', { email, password }); }
export function registerAccount(email: string, password: string, name: string) { return authRequest('register', { email, password, name }); }
export function saveSession(session: AuthSession) { localStorage.setItem('meshly.session', JSON.stringify(session)); }
export function getSession(): AuthSession | null { const value = localStorage.getItem('meshly.session'); return value ? JSON.parse(value) as AuthSession : null; }
export function getAccessToken() { return getSession()?.tokens.accessToken || null; }
export async function refreshSession() { const session = getSession(); if (!session) return null; const refreshed = await authRequest('refresh', { refreshToken: session.tokens.refreshToken }); saveSession(refreshed); return refreshed; }
export async function signOut() { const session = getSession(); if (session) await fetch(`${apiUrl}/api/auth/logout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: session.tokens.refreshToken }) }); localStorage.removeItem('meshly.session'); }
