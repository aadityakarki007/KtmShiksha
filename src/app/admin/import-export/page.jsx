"use client";

import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const IMPORT_ENTITY_ITEMS = { students: "Students", teachers: "Teachers" };
const DUPLICATE_STRATEGY_ITEMS = {
  skip: "Skip duplicates",
  update: "Update duplicates",
};

export default function AdminImportExportPage() {
  const [entity, setEntity] = useState("students");
  const [duplicateStrategy, setDuplicateStrategy] = useState("skip");
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("entity", entity);
      fd.append("mode", "preview");
      fd.append("duplicateStrategy", duplicateStrategy);

      const res = await fetch("/api/import", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Preview failed");
      setPreview(data);
      toast.success("Preview ready");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function commit() {
    if (!preview?.prepared?.length) {
      toast.error("Nothing to import");
      return;
    }
    setBusy(true);
    try {
      const data = await apiFetch("/api/import", {
        method: "POST",
        body: JSON.stringify({
          entity,
          mode: "commitPrepared",
          duplicateStrategy,
          prepared: preview.prepared,
        }),
      });
      toast.success(`Imported ${data.results?.length ?? 0} rows`);
      setPreview(null);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  function downloadTemplate(type, format) {
    window.open(`/api/export?template=true&type=${type}&format=${format}`, "_blank");
  }

  function downloadExport(type, format) {
    window.open(`/api/export?type=${type}&format=${format}`, "_blank");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Import & export</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Upload spreadsheets after downloading the templates. Preview validates rows, surfaces duplicates, and
          blocks bad data before commit.
        </p>
      </div>

      <Tabs defaultValue="import">
        <TabsList>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload file</CardTitle>
              <CardDescription>Supports .csv, .xlsx, and .xls sources.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Dataset</Label>
                  <Select value={entity} onValueChange={setEntity} items={IMPORT_ENTITY_ITEMS}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="teachers">Teachers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duplicates</Label>
                  <Select
                    value={duplicateStrategy}
                    onValueChange={setDuplicateStrategy}
                    items={DUPLICATE_STRATEGY_ITEMS}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Skip duplicates</SelectItem>
                      <SelectItem value="update">Update duplicates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>File</Label>
                  <InputFile onPick={(f) => handleFile(f)} disabled={busy} />
                </div>
              </div>

              {preview && (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                    <p>
                      Prepared rows: <strong>{preview.prepared?.length ?? 0}</strong>
                    </p>
                    <p>
                      Skipped duplicates: <strong>{preview.summary?.skipped ?? 0}</strong>
                    </p>
                    <p>
                      Validation errors: <strong>{preview.summary?.errors?.length ?? 0}</strong>
                    </p>
                  </div>

                  {preview.summary?.errors?.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.summary.errors.map((err, idx) => (
                          <TableRow key={`${err.row}-${idx}`}>
                            <TableCell>{err.row}</TableCell>
                            <TableCell>{err.message}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  <Button disabled={busy || !preview.prepared?.length} onClick={commit}>
                    Commit import
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Download templates</CardTitle>
              <CardDescription>Use these headers to prepare clean uploads.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => downloadTemplate("students", "xlsx")}>
                Student template (.xlsx)
              </Button>
              <Button variant="outline" onClick={() => downloadTemplate("teachers", "csv")}>
                Teacher template (.csv)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export live data</CardTitle>
              <CardDescription>Administrator-only snapshots for compliance and analysis.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => downloadExport("students", "xlsx")}>
                Students
              </Button>
              <Button variant="secondary" onClick={() => downloadExport("teachers", "xlsx")}>
                Teachers
              </Button>
              <Button variant="secondary" onClick={() => downloadExport("attendance", "csv")}>
                Attendance
              </Button>
              <Button variant="secondary" onClick={() => downloadExport("marks", "csv")}>
                Marks
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InputFile({ onPick, disabled }) {
  return (
    <input
      type="file"
      accept=".csv,.xlsx,.xls"
      disabled={disabled}
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onPick(file);
      }}
    />
  );
}
