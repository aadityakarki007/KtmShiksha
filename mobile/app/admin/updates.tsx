import { JsonFlatList } from "@/components/JsonFlatList";
import { useCallback } from "react";

type Update = {
  _id: string;
  title?: string;
  pinned?: boolean;
};

export default function AdminUpdates() {
  const toRows = useCallback((items: unknown[]) => {
    return (items as Update[]).map((u) => ({
      id: String(u._id),
      title: (u.pinned ? "📌 " : "") + (u.title ?? "Update"),
      subtitle: undefined,
    }));
  }, []);

  return <JsonFlatList endpoint="/api/updates?limit=50" toRows={toRows} />;
}
