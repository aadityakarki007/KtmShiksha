import { JsonFlatList } from "@/components/JsonFlatList";
import { useCallback } from "react";

type AttRow = {
  _id: string;
  date?: string;
  status?: string;
  classId?: { name?: string };
  sectionId?: { name?: string };
};

export default function StudentAttendance() {
  const toRows = useCallback((items: unknown[]) => {
    return (items as AttRow[]).map((a) => ({
      id: String(a._id),
      title: a.date ? new Date(a.date).toLocaleDateString() : "Date",
      subtitle: [a.status, a.classId?.name, a.sectionId?.name].filter(Boolean).join(" · "),
    }));
  }, []);

  return <JsonFlatList endpoint="/api/attendance?limit=60" toRows={toRows} />;
}
