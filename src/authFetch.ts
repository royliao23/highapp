// authFetch.ts
import { getValidAccessToken } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_NODE!;

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = await getValidAccessToken();
  if (!token) throw new Error("No valid auth token");

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, { ...init, headers });
}
