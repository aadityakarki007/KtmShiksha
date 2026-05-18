import { JsonFlatList } from "@/components/JsonFlatList";
import { useCallback } from "react";

type Subject = {
  _id: string;
  name?: string;
  code?: string;
};

export default function AdminSubjects() {
  const toRows = useCallback((items: unknown[]) => {
    return (items as Subject[]).map((s) => ({
      id: String(s._id),
      title: s.name ?? "Subject",
      subtitle: s.code,
    }));
  }, []);

  return <JsonFlatList endpoint="/api/subjects?limit=50" toRows={toRows} />;
}
