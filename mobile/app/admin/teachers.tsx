import { JsonFlatList } from "@/components/JsonFlatList";
import { useCallback } from "react";

type Teacher = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  employeeId?: string;
};

export default function AdminTeachers() {
  const toRows = useCallback((items: unknown[]) => {
    return (items as Teacher[]).map((t) => {
      const name = `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() || "Teacher";
      return {
        id: String(t._id),
        title: name,
        subtitle: [t.employeeId, t.email].filter(Boolean).join(" · "),
      };
    });
  }, []);

  return <JsonFlatList endpoint="/api/teachers?limit=50" toRows={toRows} />;
}
