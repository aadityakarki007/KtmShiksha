"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function StudentMarksPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch("/api/marks?limit=200");
        setRows(res.data);
      } catch (e) {
        toast.error(e.message);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Marks & report cards</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Scores sync whenever teachers publish results for your exams.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Published marks</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m._id}>
                  <TableCell>{m.examId?.name}</TableCell>
                  <TableCell>{m.subjectId?.name}</TableCell>
                  <TableCell>
                    {m.score}/{m.maxScore}
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No marks recorded yet.
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
