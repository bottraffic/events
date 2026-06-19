import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { isDemo, mockApi } from './mock';

const API_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string) ?? 'http://10.0.2.2:4000/v1';

const TOKEN_KEY = 'simcha_token';
const REFRESH_KEY = 'simcha_refresh';

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}
export async function setSession(token: string, refresh: string) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [REFRESH_KEY, refresh],
  ]);
}
export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY]);
}

/**
 * Same contract as the web client. In demo mode it resolves against local
 * mock data; otherwise it hits the shared NestJS API — so mobile and web read
 * and write the exact same backend (full sync).
 */
export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  if (isDemo()) return mockApi(path, options) as Promise<T>;

  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
