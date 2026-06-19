'use client';

import { isDemo, mockApi } from './mock';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('simcha_token');
}

export function setSession(token: string, refresh: string) {
  localStorage.setItem('simcha_token', token);
  localStorage.setItem('simcha_refresh', refresh);
}

export function clearSession() {
  localStorage.removeItem('simcha_token');
  localStorage.removeItem('simcha_refresh');
}

export async function api<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (isDemo()) return mockApi(path, options) as Promise<T>;

  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401 && typeof window !== 'undefined') {
    clearSession();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
