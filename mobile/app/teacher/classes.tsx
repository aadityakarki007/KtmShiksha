import { JsonFlatList } from "@/components/JsonFlatList";
import { useCallback } from "react";

type Row = {
  _id: string;
  assignments?: {
    classId?: { name?: string; level?: string | number };
    sectionId?: { name?: string };
    subjectId?: { name?: string; code?: string };
  }[];
};

export default function TeacherClasses() {
  const toRows = useCallback((items: unknown[]) => {
    const t = (items as Row[])[0];
    if (!t) {
      return [
        {
          id: "no-profile",
          title: "No teacher profile",
          subtitle: "Ask an admin to create your teacher record and assignments.",
        },
      ];
    }
    if (!t.assignments?.length) {
      return [
        {
          id: "none",
          title: "No assignments yet",
          subtitle: "Ask an admin to link your account to classes.",
        },
      ];
    }
    return t.assignments.map((a, i) => ({
      id: `${String(t._id)}-${i}`,
      title: [a.classId?.name, a.sectionId?.name].filter(Boolean).join(" · ") || "Class",
      subtitle: [a.subjectId?.name ?? a.subjectId?.code, a.classId?.level != null ? `Level ${a.classId.level}` : ""]
        .filter(Boolean)
        .join(" · "),
    }));
  }, []);

  return <JsonFlatList endpoint="/api/teachers?limit=1" toRows={toRows} />;
}
