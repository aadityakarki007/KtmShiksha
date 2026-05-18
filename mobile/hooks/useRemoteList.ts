import { useAuthorizedFetch } from "@/hooks/useAuthorizedFetch";
import { extractList } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export function useRemoteList(endpoint: string) {
  const authFetch = useAuthorizedFetch();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<unknown[]>([]);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const json = await authFetch<unknown>(endpoint);
      setData(extractList(json));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authFetch, endpoint]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    reload();
  }, [reload]);

  return { loading, error, data, reload, refreshing, onRefresh };
}
