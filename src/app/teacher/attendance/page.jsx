"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client-api";
import { ATTENDANCE_STATUS } from "@/lib/constants";
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

export default function TeacherAttendancePage() {
  const [teacher, setTeacher] = useState(null);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [sections, setSections] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadTeacher() {
      try {
        const res = await apiFetch("/api/teachers?limit=5");
        const self = res.data[0];
        setTeacher(self || null);
      } catch {
        setTeacher(null);
      }
    }
    loadTeacher();
  }, []);

  const classOptions = useMemo(() => {
    if (!teacher?.assignments?.length) return [];
    const map = new Map();
    teacher.assignments.forEach((a) => {
      const cid = String(a.classId?._id ?? a.classId ?? "");
      if (!cid) return;
      if (!map.has(cid)) {
        map.set(cid, {
          _id: cid,
          name: a.classId?.name ?? "",
          level: a.classId?.level ?? "",
        });
      }
    });
    return [...map.values()];
  }, [teacher]);

  function getClassLabel(c) {
    if (!c) return "";
    const name = String(c.name || "");
    const level = String(c.level || "");
    if (/^[a-f\d]{24}$/i.test(name) && level) return level;
    if (name && level && name !== level) return `${name} (${level})`;
    return name || level || "";
  }

  useEffect(() => {
    async function loadSections() {
      if (!classId) {
        setSections([]);
        return;
      }
      try {
        const res = await apiFetch(`/api/sections?classId=${classId}&limit=200`);
        setSections(res.data);
      } catch {
        setSections([]);
      }
    }
    loadSections();
  }, [classId]);

  async function loadStudents() {
    if (!classId || !sectionId) {
      toast.error("Choose class and section");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch(
        `/api/students?classId=${classId}&sectionId=${sectionId}&limit=200`
      );
      setStudents(res.data);
      const initial = {};
      res.data.forEach((s) => {
        initial[s._id] = "present";
      });
      setStatusMap(initial);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!classId || !sectionId || !students.length) {
      toast.error("Load students before saving");
      return;
    }
    try {
      await apiFetch("/api/attendance", {
        method: "POST",
        body: JSON.stringify({
          date: new Date(date).toISOString(),
          classId,
          sectionId,
          entries: students.map((s) => ({
            studentId: s._id,
            status: statusMap[s._id] || "present",
          })),
        }),
      });
      toast.success("Attendance saved");
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Daily attendance</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Select your teaching section, load learners, adjust statuses, and submit in one pass.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Class</Label>
            <Select value={classId} onValueChange={(v) => setClassId(v)}>
              <SelectTrigger>
                <SelectValue>
                  {getClassLabel(classOptions.find((c) => String(c._id) === classId)) || "Choose class"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {classOptions.map((c) => (
                  <SelectItem key={String(c._id)} value={String(c._id)}>
                    {getClassLabel(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Section</Label>
            <Select value={sectionId} onValueChange={setSectionId}>
              <SelectTrigger>
                <SelectValue>
                  {sections.find((s) => String(s._id) === sectionId)?.name || "Choose section"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={String(s._id)} value={String(s._id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={loadStudents}>
              Load roster
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Roster</CardTitle>
          <Button size="sm" onClick={submit} disabled={loading || !students.length}>
            Save attendance
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s._id}>
                  <TableCell>
                    {s.firstName} {s.lastName}
                  </TableCell>
                  <TableCell>{s.rollNumber || "—"}</TableCell>
                  <TableCell className="w-48">
                    <Select
                      value={statusMap[s._id] || "present"}
                      onValueChange={(v) =>
                        setStatusMap((m) => ({
                          ...m,
                          [s._id]: v,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ATTENDANCE_STATUS.map((st) => (
                          <SelectItem key={st} value={st}>
                            {st}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {!students.length && (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    Load a roster to begin marking.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
