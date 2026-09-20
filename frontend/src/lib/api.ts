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
export type Pagination = { page: number; limit: number; total: number; totalPages: number };
export type Paginated<T> = { items: T[]; pagination: Pagination };

export const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function getProducts(filters?: { search?: string; category?: string; page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.category && filters.category !== 'All') params.set('category', filters.category);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  const query = params.toString();
  const { apiFetch } = await import('./api-client');
  return apiFetch<Paginated<Product>>(`/api/products${query ? `?${query}` : ''}`, { cache: 'no-store' });
}

export async function getProduct(id: string) {
  const { apiFetch } = await import('./api-client');
  return apiFetch<Product>(`/api/products/${id}`, { cache: 'no-store' });
}

export type AuthUser = { id: string; email: string; name: string | null; role: string };
export type AuthSession = { user: AuthUser };

async function authRequest(path: string, body: Record<string, string>) {
  const response = await fetch(`${apiUrl}/api/auth/${path}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const payload = await response.json() as { success: boolean; message?: string; data?: AuthSession };
  if (!response.ok || !payload.data) throw new Error(payload.message || 'Authentication request failed.');
  return payload.data;
}

export function signIn(email: string, password: string) { return authRequest('login', { email, password }); }
export function registerAccount(email: string, password: string, name: string) { return authRequest('register', { email, password, name }); }
export async function getCurrentUser() {
  const response = await fetch(`${apiUrl}/api/auth/me`, { credentials: 'include' });
  if (response.status === 401) {
    await refreshSession();
    return getCurrentUser();
  }
  const payload = await response.json() as { success: boolean; message?: string; data?: AuthSession };
  if (!response.ok || !payload.data) throw new Error(payload.message || 'Authentication required.');
  return payload.data;
}
export function refreshSession() { return authRequest('refresh', {}); }
export async function signOut() { await fetch(`${apiUrl}/api/auth/logout`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }); }
