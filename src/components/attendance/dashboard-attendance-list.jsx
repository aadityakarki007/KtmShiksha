"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/client-api";
import { formatAdAsBsLongEn } from "@/lib/nepali-date";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DashboardAttendanceList({ role }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/attendance?limit=25&page=1`);
        setRows(res.data ?? []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [role]);

  const href = role === "admin" ? "/admin/attendance" : "/teacher/attendance";

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
        <div>
          <CardTitle>Recent attendance</CardTitle>
          <CardDescription>
            Dates in Bikram Sambat (BS). Open attendance for any class or day.
          </CardDescription>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={href}>View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">No attendance rows yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>BS date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r._id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatAdAsBsLongEn(r.date)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.studentId?.firstName} {r.studentId?.lastName}
                  </TableCell>
                  <TableCell className="text-sm">{r.classId?.name}</TableCell>
                  <TableCell className="text-sm">{r.sectionId?.name}</TableCell>
                  <TableCell className="text-sm capitalize">{r.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
