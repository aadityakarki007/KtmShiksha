"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client-api";
import {
  bsYmdToLocalDayBoundsIso,
  defaultBsYmd,
  formatAdAsBsLongEn,
  isValidBsYmd,
} from "@/lib/nepali-date";
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

export default function AdminAttendancePage() {
  const [rows, setRows] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [filters, setFilters] = useState({
    classId: "",
    sectionId: "",
    bsStart: defaultBsYmd(),
    bsEnd: defaultBsYmd(),
  });

  async function loadRefs() {
    try {
      const c = await apiFetch("/api/classes?limit=100&page=1");
      setClasses(c.data ?? []);
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
      const res = await apiFetch(`/api/sections?classId=${classId}&limit=100&page=1`);
      setSections(res.data ?? []);
    } catch {
      setSections([]);
    }
  }

  async function loadAttendance() {
    try {
      const params = new URLSearchParams({ limit: "100", page: "1" });
      if (filters.classId) params.set("classId", filters.classId);
      if (filters.sectionId) params.set("sectionId", filters.sectionId);

      if (isValidBsYmd(filters.bsStart) && isValidBsYmd(filters.bsEnd)) {
        const startIso = bsYmdToLocalDayBoundsIso(filters.bsStart).startIso;
        const endIso = bsYmdToLocalDayBoundsIso(filters.bsEnd).endIso;
        params.set("startDate", startIso);
        params.set("endDate", endIso);
      }

      const res = await apiFetch(`/api/attendance?${params.toString()}`);
      setRows(res.data ?? []);
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
  }, [filters.classId, filters.sectionId, filters.bsStart, filters.bsEnd]);

  const classSelectItems = useMemo(
    () => selectItemsById(classes, (c) => c.name),
    [classes]
  );
  const sectionSelectItems = useMemo(
    () => selectItemsById(sections, (s) => s.name),
    [sections]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Filter by class, section, and Bikram Sambat (BS) date range. Records show BS with AD in
          parentheses.
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
              items={classSelectItems}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, classId: v, sectionId: "" }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All classes" />
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
            <Label>Section</Label>
            <Select
              value={filters.sectionId}
              items={sectionSelectItems}
              onValueChange={(v) => setFilters((f) => ({ ...f, sectionId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All sections" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s._id} value={String(s._id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>From (BS)</Label>
            <Input
              placeholder="2081-01-01"
              value={filters.bsStart}
              onChange={(e) =>
                setFilters((f) => ({ ...f, bsStart: e.target.value.replace(/\//g, "-") }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>To (BS)</Label>
            <Input
              placeholder="2081-01-31"
              value={filters.bsEnd}
              onChange={(e) =>
                setFilters((f) => ({ ...f, bsEnd: e.target.value.replace(/\//g, "-") }))
              }
            />
          </div>
          <div className="flex flex-wrap items-end gap-2 md:col-span-2 lg:col-span-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters((f) => ({ ...f, bsStart: defaultBsYmd(), bsEnd: defaultBsYmd() }))
              }
            >
              Today (BS)
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={loadAttendance}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Records</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date (BS)</TableHead>
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
                  <TableCell className="whitespace-nowrap">
                    <span className="font-medium">{formatAdAsBsLongEn(r.date)}</span>
                    <span className="text-muted-foreground block text-xs">
                      {r.date
                        ? new Date(r.date).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}{" "}
                      AD
                    </span>
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
