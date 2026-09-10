import { useAuth } from "../store/auth";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://paktest-prep.vercel.app";

/**
 * Fetch wrapper that talks to the PakTest Prep web backend.
 * Automatically attaches the mobile auth token (if signed in) so
 * endpoints like /api/history recognize the user.
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = useAuth.getState().token;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  return res;
}
