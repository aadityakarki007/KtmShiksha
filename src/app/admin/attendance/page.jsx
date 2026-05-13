"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
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

export default function AdminAttendancePage() {
  const [rows, setRows] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [filters, setFilters] = useState({
    classId: "",
    sectionId: "",
    startDate: "",
    endDate: "",
  });

  async function loadRefs() {
    try {
      const c = await apiFetch("/api/classes?limit=200");
      setClasses(c.data);
    } catch {
      /* ignore */
    }
  }

  async function loadSections(classId) {
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

  async function loadAttendance() {
    try {
      const params = new URLSearchParams({ limit: "100", page: "1" });
      if (filters.classId) params.set("classId", filters.classId);
      if (filters.sectionId) params.set("sectionId", filters.sectionId);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      const res = await apiFetch(`/api/attendance?${params.toString()}`);
      setRows(res.data);
    } catch (e) {
      toast.error(e.message);
    }
  }

  useEffect(() => {
    loadRefs();
  }, []);

  useEffect(() => {
    loadSections(filters.classId);
  }, [filters.classId]);

  useEffect(() => {
    loadAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.classId, filters.sectionId, filters.startDate, filters.endDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Audit daily attendance captured by teachers. Filters help reconcile exports and interventions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Class</Label>
            <Select
              value={filters.classId}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, classId: v, sectionId: "" }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Section</Label>
            <Select
              value={filters.sectionId}
              onValueChange={(v) => setFilters((f) => ({ ...f, sectionId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All sections" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Start date</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>End date</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Records</CardTitle>
          <Button variant="outline" size="sm" onClick={loadAttendance}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Marked by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>
                    {r.date ? format(new Date(r.date), "yyyy-MM-dd") : "—"}
                  </TableCell>
                  <TableCell>
                    {r.studentId?.firstName} {r.studentId?.lastName}
                  </TableCell>
                  <TableCell>{r.classId?.name}</TableCell>
                  <TableCell>{r.sectionId?.name}</TableCell>
                  <TableCell className="capitalize">{r.status}</TableCell>
                  <TableCell>
                    {r.markedBy?.firstName} {r.markedBy?.lastName}
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
