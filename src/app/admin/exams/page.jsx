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

export default function AdminExamsPage() {
  const [rows, setRows] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    name: "",
    classId: "",
    subjectId: "",
    academicYear: "",
    maxScore: "100",
    examType: "written",
  });

  async function load() {
    try {
      const res = await apiFetch("/api/exams?limit=200");
      setRows(res.data);
    } catch (e) {
      toast.error(e.message);
    }
  }

  useEffect(() => {
    load();
    async function refs() {
      try {
        const [c, s] = await Promise.all([
          apiFetch("/api/classes?limit=200"),
          apiFetch("/api/subjects?limit=300"),
        ]);
        setClasses(c.data);
        setSubjects(s.data);
      } catch {
        /* ignore */
      }
    }
    refs();
  }, []);

  const classSelectItems = useMemo(
    () => selectItemsById(classes, (c) => c.name),
    [classes]
  );
  const subjectSelectItems = useMemo(
    () => selectItemsById(subjects, (s) => s.name),
    [subjects]
  );

  async function create(e) {
    e.preventDefault();
    try {
      await apiFetch("/api/exams", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          maxScore: Number(form.maxScore),
        }),
      });
      toast.success("Exam created");
      setForm({
        name: "",
        classId: "",
        subjectId: "",
        academicYear: "",
        maxScore: "100",
        examType: "written",
      });
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function remove(id) {
    try {
      await apiFetch(`/api/exams/${id}`, { method: "DELETE" });
      toast.success("Exam deleted");
      await load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Exams</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Schedule assessments aligned to classes and subjects before entering marks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create exam</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" onSubmit={create}>
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label>Name</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select
                value={form.classId}
                items={classSelectItems}
                onValueChange={(v) => setForm((f) => ({ ...f, classId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c._id} value={String(c._id)}>
                      {c.name}
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
              <Label>Max score</Label>
              <Input
                type="number"
                value={form.maxScore}
                onChange={(e) => setForm((f) => ({ ...f, maxScore: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Academic year</Label>
              <Input
                value={form.academicYear}
                onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Save exam
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled exams</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Max</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((ex) => (
                <TableRow key={ex._id}>
                  <TableCell className="font-medium">{ex.name}</TableCell>
                  <TableCell>{ex.classId?.name}</TableCell>
                  <TableCell>{ex.subjectId?.name}</TableCell>
                  <TableCell>{ex.maxScore}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => remove(ex._id)}>
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
