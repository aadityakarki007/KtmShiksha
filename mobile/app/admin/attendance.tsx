import { JsonFlatList } from "@/components/JsonFlatList";
import { useCallback } from "react";

type AttRow = {
  _id: string;
  date?: string;
  status?: string;
  studentId?: { firstName?: string; lastName?: string; rollNumber?: string };
  classId?: { name?: string };
  sectionId?: { name?: string };
};

export default function AdminAttendance() {
  const toRows = useCallback((items: unknown[]) => {
    return (items as AttRow[]).map((a) => {
      const student = `${a.studentId?.firstName ?? ""} ${a.studentId?.lastName ?? ""}`.trim();
      const when = a.date ? new Date(a.date).toLocaleDateString() : "";
      return {
        id: String(a._id),
        title: student || "Attendance",
        subtitle: [a.status, when, a.classId?.name, a.sectionId?.name].filter(Boolean).join(" · "),
      };
    });
  }, []);

  return <JsonFlatList endpoint="/api/attendance?limit=40" toRows={toRows} />;
}
