"use client";

import { useEffect, useMemo, useState } from "react";
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
import { selectItemsById } from "@/lib/select-items";

export default function AdminMarksPage() {
  const [marks, setMarks] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    examId: "",
    subjectId: "",
    studentId: "",
    score: "",
    maxScore: "",
  });

  async function loadMarks() {
    try {
      const res = await apiFetch("/api/marks?limit=100");
      setMarks(res.data);
    } catch (e) {
      toast.error(e.message);
    }
  }

  useEffect(() => {
    loadMarks();
    async function refs() {
      try {
        const [ex, st, su] = await Promise.all([
          apiFetch("/api/exams?limit=500"),
          apiFetch("/api/students?limit=500"),
          apiFetch("/api/subjects?limit=300"),
        ]);
        setExams(ex.data);
        setStudents(st.data);
        setSubjects(su.data);
      } catch {
        /* ignore */
      }
    }
    refs();
  }, []);

  const examSelectItems = useMemo(
    () =>
      selectItemsById(exams, (ex) =>
        ex.classId?.name != null ? `${ex.name} · ${ex.classId.name}` : ex.name
      ),
    [exams]
  );
  const subjectSelectItems = useMemo(
    () => selectItemsById(subjects, (s) => s.name),
    [subjects]
  );
  const studentSelectItems = useMemo(
    () => selectItemsById(students, (st) => `${st.firstName} ${st.lastName}`),
    [students]
  );

  async function saveMark(e) {
    e.preventDefault();
    try {
      await apiFetch("/api/marks", {
        method: "POST",
        body: JSON.stringify({
          examId: form.examId,
          subjectId: form.subjectId,
          studentId: form.studentId,
          score: Number(form.score),
          maxScore: form.maxScore ? Number(form.maxScore) : undefined,
        }),
      });
      toast.success("Mark saved");
      setForm({ examId: "", subjectId: "", studentId: "", score: "", maxScore: "" });
      await loadMarks();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function removeMark(id) {
    try {
      await apiFetch(`/api/marks/${id}`, { method: "DELETE" });
      toast.success("Mark deleted");
      await loadMarks();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Marks</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Record or adjust scores per exam, subject, and learner. Students and teachers use scoped APIs with the
          same schema for mobile clients.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter mark</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" onSubmit={saveMark}>
            <div className="space-y-2">
              <Label>Exam</Label>
              <Select
                value={form.examId}
                items={examSelectItems}
                onValueChange={(v) => setForm((f) => ({ ...f, examId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {exams.map((ex) => (
                    <SelectItem key={ex._id} value={String(ex._id)}>
                      {ex.name} · {ex.classId?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={form.subjectId}
                items={subjectSelectItems}
                onValueChange={(v) => setForm((f) => ({ ...f, subjectId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s._id} value={String(s._id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Student</Label>
              <Select
                value={form.studentId}
                items={studentSelectItems}
                onValueChange={(v) => setForm((f) => ({ ...f, studentId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {students.map((st) => (
                    <SelectItem key={st._id} value={String(st._id)}>
                      {st.firstName} {st.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Score</Label>
              <Input
                required
                type="number"
                value={form.score}
                onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Max score (optional)</Label>
              <Input
                type="number"
                value={form.maxScore}
                onChange={(e) => setForm((f) => ({ ...f, maxScore: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Save mark
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent marks</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marks.map((m) => (
                <TableRow key={m._id}>
                  <TableCell>
                    {m.studentId?.firstName} {m.studentId?.lastName}
                  </TableCell>
                  <TableCell>{m.examId?.name}</TableCell>
                  <TableCell>{m.subjectId?.name}</TableCell>
                  <TableCell>
                    {m.score}/{m.maxScore}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => removeMark(m._id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
