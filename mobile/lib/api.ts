/// <reference types="node" />

import Constants from "expo-constants";

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;
  const fromExtra = extra?.apiBaseUrl;
  return String(fromEnv || fromExtra || "")
    .trim()
    .replace(/\/$/, "");
}

export function getClerkPublishableKey(): string {
  return (
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    (Constants.expoConfig?.extra as { clerkPublishableKey?: string } | undefined)
      ?.clerkPublishableKey ||
    ""
  ).trim();
}

export async function apiFetch<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    getToken: () => Promise<string | null>;
  }
): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "Set EXPO_PUBLIC_API_BASE_URL to your Next.js site origin (e.g. https://your-app.vercel.app)"
    );
  }
  const token = await options.getToken();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers();
  headers.set("Accept", "application/json");
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      typeof json.error === "string" ? json.error : `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return json as T;
}

export function extractList<T>(json: unknown): T[] {
  if (json && typeof json === "object" && "data" in json) {
    const data = (json as { data: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
}
