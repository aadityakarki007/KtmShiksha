import { JsonFlatList } from "@/components/JsonFlatList";
import { useCallback } from "react";

type Notice = {
  _id: string;
  title?: string;
  audience?: string;
  pinned?: boolean;
};

export default function TeacherNotices() {
  const toRows = useCallback((items: unknown[]) => {
    return (items as Notice[]).map((n) => ({
      id: String(n._id),
      title: (n.pinned ? "📌 " : "") + (n.title ?? "Notice"),
      subtitle: n.audience,
    }));
  }, []);

  return <JsonFlatList endpoint="/api/notices?limit=50" toRows={toRows} />;
}
