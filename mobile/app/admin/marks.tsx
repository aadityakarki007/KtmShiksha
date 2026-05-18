import { JsonFlatList } from "@/components/JsonFlatList";
import { useCallback } from "react";

type MarkRow = {
  _id: string;
  score?: number;
  examId?: { name?: string; maxScore?: number };
  subjectId?: { name?: string; code?: string };
  studentId?: { firstName?: string; lastName?: string; rollNumber?: string };
};

export default function AdminMarks() {
  const toRows = useCallback((items: unknown[]) => {
    return (items as MarkRow[]).map((m) => {
      const student = `${m.studentId?.firstName ?? ""} ${m.studentId?.lastName ?? ""}`.trim();
      return {
        id: String(m._id),
        title: student || "Mark",
        subtitle: [
          m.examId?.name,
          m.subjectId?.name ?? m.subjectId?.code,
          m.score != null && m.examId?.maxScore != null ? `${m.score} / ${m.examId.maxScore}` : m.score,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    });
  }, []);

  return <JsonFlatList endpoint="/api/marks?limit=40" toRows={toRows} />;
}
