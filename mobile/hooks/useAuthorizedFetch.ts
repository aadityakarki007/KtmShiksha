import { useAuth } from "@clerk/clerk-expo";
import { useCallback } from "react";
import { apiFetch } from "@/lib/api";

export function useAuthorizedFetch() {
  const { getToken } = useAuth();
  return useCallback(
    <T,>(path: string, init?: { method?: string; body?: unknown }) =>
      apiFetch<T>(path, { getToken, ...init }),
    [getToken]
  );
}
