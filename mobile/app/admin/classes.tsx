import { JsonFlatList } from "@/components/JsonFlatList";
import { useCallback } from "react";

type Cls = {
  _id: string;
  name?: string;
  level?: string | number;
  academicYear?: string;
};

export default function AdminClasses() {
  const toRows = useCallback((items: unknown[]) => {
    return (items as Cls[]).map((c) => ({
      id: String(c._id),
      title: c.name ?? "Class",
      subtitle: [c.level != null ? `Level ${c.level}` : "", c.academicYear].filter(Boolean).join(" · "),
    }));
  }, []);

  return <JsonFlatList endpoint="/api/classes?limit=50" toRows={toRows} />;
}
