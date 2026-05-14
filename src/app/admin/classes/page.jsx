"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { GRADE_LEVELS } from "@/lib/constants";
import { apiFetch } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const DEFAULT_CLASS_LEVELS = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export default function AdminClassesPage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [classForm, setClassForm] = useState({ name: "", level: "Nursery", academicYear: "" });
  const [sectionForm, setSectionForm] = useState({ name: "", classId: "" });

  async function loadClasses() {
    try {
      const res = await apiFetch("/api/classes?limit=200");
      const existing = res.data ?? [];
      const existingLevels = new Set(existing.map((c) => String(c.level)));
      const missingLevels = DEFAULT_CLASS_LEVELS.filter((lvl) => !existingLevels.has(lvl));

      if (missingLevels.length > 0) {
        await Promise.all(
          missingLevels.map((level) =>
            apiFetch("/api/classes", {
              method: "POST",
              body: JSON.stringify({ name: level, level, academicYear: "" }),
            })
          )
        );
        const refreshed = await apiFetch("/api/classes?limit=200");
        setClasses(refreshed.data ?? []);
        toast.success("Default classes created");
        return;
      }

      setClasses(existing);
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function loadSections() {
    try {
      const res = await apiFetch("/api/sections?limit=500");
      setSections(res.data);
    } catch (e) {
      toast.error(e.message);
    }
  }

  useEffect(() => {
    loadClasses();
    loadSections();
  }, []);

  const levelSelectItems = useMemo(
    () => Object.fromEntries(GRADE_LEVELS.map((lvl) => [lvl, lvl])),
    []
  );
  const sectionClassSelectItems = useMemo(
    () => selectItemsById(classes, (c) => c.name),
    [classes]
  );

  async function createClass(e) {
    e.preventDefault();
    try {
      await apiFetch("/api/classes", {
        method: "POST",
        body: JSON.stringify(classForm),
      });
      toast.success("Class created");
      setClassForm({ name: "", level: "Nursery", academicYear: "" });
      await loadClasses();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function deleteClass(id) {
    try {
      await apiFetch(`/api/classes/${id}`, { method: "DELETE" });
      toast.success("Class deleted");
      await loadClasses();
      await loadSections();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function createSection(e) {
    e.preventDefault();
    try {
      await apiFetch("/api/sections", {
        method: "POST",
        body: JSON.stringify(sectionForm),
      });
      toast.success("Section created");
      setSectionForm({ name: "", classId: "" });
      await loadSections();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function deleteSection(id) {
    try {
      await apiFetch(`/api/sections/${id}`, { method: "DELETE" });
      toast.success("Section deleted");
      await loadSections();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Classes & sections</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Structure grade levels and homeroom sections used across admissions and attendance.
        </p>
      </div>

      <Tabs defaultValue="classes">
        <TabsList>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add class</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-4" onSubmit={createClass}>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    required
                    value={classForm.name}
                    onChange={(e) => setClassForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Grade 5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select
                    value={classForm.level}
                    items={levelSelectItems}
                    onValueChange={(v) => setClassForm((f) => ({ ...f, level: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {GRADE_LEVELS.map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>
                          {lvl}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Academic year</Label>
                  <Input
                    value={classForm.academicYear}
                    onChange={(e) => setClassForm((f) => ({ ...f, academicYear: e.target.value }))}
                    placeholder="2081 BS"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full">
                    Save class
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Classes</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.level}</TableCell>
                      <TableCell>{c.academicYear || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => deleteClass(c._id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add section</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-3" onSubmit={createSection}>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select
                    value={sectionForm.classId}
                    items={sectionClassSelectItems}
                    onValueChange={(v) => setSectionForm((f) => ({ ...f, classId: v }))}
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
                  <Label>Section name</Label>
                  <Input
                    required
                    value={sectionForm.name}
                    onChange={(e) => setSectionForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="A"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full">
                    Save section
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sections</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.classId?.name ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => deleteSection(s._id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
