import { JsonFlatList } from "@/components/JsonFlatList";
import { useCallback } from "react";

type Exam = {
  _id: string;
  name?: string;
  examType?: string;
  classId?: { name?: string };
  subjectId?: { name?: string; code?: string };
};

export default function AdminExams() {
  const toRows = useCallback((items: unknown[]) => {
    return (items as Exam[]).map((e) => ({
      id: String(e._id),
      title: e.name ?? "Exam",
      subtitle: [e.examType, e.classId?.name, e.subjectId?.name ?? e.subjectId?.code]
        .filter(Boolean)
        .join(" · "),
    }));
  }, []);

  return <JsonFlatList endpoint="/api/exams?limit=50" toRows={toRows} />;
}
