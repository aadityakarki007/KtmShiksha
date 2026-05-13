"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TeacherMarksPage() {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [exam, setExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});

  useEffect(() => {
    async function loadExams() {
      try {
        const res = await apiFetch("/api/exams?limit=300");
        setExams(res.data);
      } catch (e) {
        toast.error(e.message);
      }
    }
    loadExams();
  }, []);

  useEffect(() => {
    async function loadExamDetail() {
      if (!examId) {
        setExam(null);
        setStudents([]);
        setScores({});
        return;
      }
      try {
        const res = await apiFetch(`/api/exams/${examId}`);
        const ex = res.data;
        setExam(ex);
        const cid = ex.classId?._id ?? ex.classId;
        const studRes = await apiFetch(`/api/students?classId=${cid}&limit=300`);
        setStudents(studRes.data);
        setScores({});
      } catch (e) {
        toast.error(e.message);
      }
    }
    loadExamDetail();
  }, [examId]);

  async function saveMark(studentId, rawScore) {
    if (!exam) return;
    try {
      await apiFetch("/api/marks", {
        method: "POST",
        body: JSON.stringify({
          examId,
          subjectId: exam.subjectId?._id ?? exam.subjectId,
          studentId,
          score: Number(rawScore),
          maxScore: exam.maxScore,
        }),
      });
      toast.success("Saved");
    } catch (e) {
      toast.error(e.message);
    }
  }

  const subjectId = exam?.subjectId?._id ?? exam?.subjectId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Marks entry</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Pick an exam aligned with your assignments, load the roster, and capture scores row by row.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select exam</CardTitle>
        </CardHeader>
        <CardContent className="max-w-xl space-y-2">
          <Label>Exam</Label>
          <Select value={examId} onValueChange={setExamId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose exam" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {exams.map((ex) => (
                <SelectItem key={ex._id} value={ex._id}>
                  {ex.name} · {ex.classId?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {exam && (
        <Card>
          <CardHeader>
            <CardTitle>
              {exam.name}{" "}
              <span className="text-muted-foreground text-base font-normal">
                · Max {exam.maxScore} · Subject{" "}
                {exam.subjectId?.name ?? (subjectId ? "linked" : "")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell>
                      {s.firstName} {s.lastName}
                    </TableCell>
                    <TableCell className="w-36">
                      <Input
                        type="number"
                        value={scores[s._id] ?? ""}
                        placeholder="0"
                        onChange={(e) =>
                          setScores((m) => ({
                            ...m,
                            [s._id]: e.target.value,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => saveMark(s._id, scores[s._id] ?? 0)}
                      >
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
