import { JsonFlatList } from "@/components/JsonFlatList";
import { useCallback } from "react";

type MarkRow = {
  _id: string;
  score?: number;
  examId?: { name?: string; maxScore?: number };
  subjectId?: { name?: string; code?: string };
};

export default function StudentMarks() {
  const toRows = useCallback((items: unknown[]) => {
    return (items as MarkRow[]).map((m) => ({
      id: String(m._id),
      title: m.examId?.name ?? "Exam",
      subtitle: [
        m.subjectId?.name ?? m.subjectId?.code,
        m.score != null && m.examId?.maxScore != null ? `${m.score} / ${m.examId.maxScore}` : m.score,
      ]
        .filter(Boolean)
        .join(" · "),
    }));
  }, []);

  return <JsonFlatList endpoint="/api/marks?limit=60" toRows={toRows} />;
}
