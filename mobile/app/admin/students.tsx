import { JsonFlatList } from "@/components/JsonFlatList";
import { useCallback } from "react";

type Student = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  rollNumber?: string;
  classId?: { name?: string };
  sectionId?: { name?: string };
};

export default function AdminStudents() {
  const toRows = useCallback((items: unknown[]) => {
    return (items as Student[]).map((s) => {
      const name = `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "Student";
      const loc = [s.classId?.name, s.sectionId?.name].filter(Boolean).join(" · ");
      return {
        id: String(s._id),
        title: name,
        subtitle: [s.rollNumber, s.email, loc].filter(Boolean).join(" · "),
      };
    });
  }, []);

  return <JsonFlatList endpoint="/api/students?limit=50" toRows={toRows} />;
}
