"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { apiFetch } from "@/lib/client-api";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  employeeId: "",
  clerkUserId: "",
  assignments: [{ classId: "", sectionId: "", subjectId: "" }],
};

export default function AdminTeachersPage() {
  const [rows, setRows] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
    });
    if (search.trim()) params.set("search", search.trim());
    return params.toString();
  }, [pagination.page, pagination.limit, search]);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/teachers?${queryString}`);
      setRows(data.data);
      setPagination((p) => ({ ...p, ...data.pagination }));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  useEffect(() => {
    async function loadRefs() {
      try {
        const [classRes, sectionRes, subjectRes] = await Promise.all([
          apiFetch("/api/classes?limit=200"),
          apiFetch("/api/sections?limit=200"),
          apiFetch("/api/subjects?limit=300"),
        ]);
        setClasses((classRes.data ?? []).map((c) => ({ ...c, _id: String(c._id) })));
        setSections(
          (sectionRes.data ?? []).map((s) => ({
            ...s,
            _id: String(s._id),
            classId: String(s.classId?._id ?? s.classId ?? ""),
          }))
        );
        setSubjects((subjectRes.data ?? []).map((s) => ({ ...s, _id: String(s._id) })));
      } catch {
        setClasses([]);
        setSections([]);
        setSubjects([]);
      }
    }

    loadRefs();
  }, []);

  useEffect(() => {
    if (!dialogOpen) return;

    const classIds = new Set(classes.map((c) => String(c._id)));
    const sectionIds = new Set(sections.map((s) => String(s._id)));
    const subjectIds = new Set(subjects.map((s) => String(s._id)));

    setForm((prev) => {
      const nextAssignments = (prev.assignments ?? []).map((a) => {
        const classId = classIds.has(a.classId) ? a.classId : "";
        const sectionId = sectionIds.has(a.sectionId) ? a.sectionId : "";
        const subjectId = subjectIds.has(a.subjectId) ? a.subjectId : "";
        return { ...a, classId, sectionId, subjectId };
      });
      return { ...prev, assignments: nextAssignments };
    });
  }, [dialogOpen, classes, sections, subjects]);

  function getClassLabel(cls) {
    if (!cls) return "";
    const name = cls.name || "";
    const level = cls.level || "";
    const objectIdLike = /^[a-f\d]{24}$/i.test(String(name));
    if (objectIdLike && level) return level;
    if (name && level && name !== level) return `${name} (${level})`;
    return name || level || "";
  }

  function getSectionLabel(section) {
    if (!section) return "";
    const name = String(section.name || "");
    return /^[a-f\d]{24}$/i.test(name) ? "Section" : name;
  }

  function getSubjectLabel(subject) {
    if (!subject) return "";
    const name = String(subject.name || "");
    const code = subject.code ? String(subject.code) : "";
    if (/^[a-f\d]{24}$/i.test(name)) return code || "Subject";
    return `${name}${code ? ` (${code})` : ""}`;
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, assignments: [{ classId: "", sectionId: "", subjectId: "" }] });
    setDialogOpen(true);
  }

  function openEdit(row) {
    setEditingId(row._id);
    setForm({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phone: row.phone ?? "",
      employeeId: row.employeeId ?? "",
      clerkUserId: row.clerkUserId ?? "",
      assignments: (row.assignments ?? []).map((a) => ({
        classId: String(a.classId?._id ?? a.classId ?? ""),
        sectionId: String(a.sectionId?._id ?? a.sectionId ?? ""),
        subjectId: String(a.subjectId?._id ?? a.subjectId ?? ""),
      })),
    });
    if (!row.assignments?.length) {
      setForm((f) => ({ ...f, assignments: [{ classId: "", sectionId: "", subjectId: "" }] }));
    }
    setDialogOpen(true);
  }

  function addAssignment() {
    setForm((f) => ({
      ...f,
      assignments: [...(f.assignments ?? []), { classId: "", sectionId: "", subjectId: "" }],
    }));
  }

  function updateAssignment(idx, key, value) {
    setForm((f) => ({
      ...f,
      assignments: (f.assignments ?? []).map((a, i) => (i === idx ? { ...a, [key]: value } : a)),
    }));
  }

  function removeAssignment(idx) {
    setForm((f) => ({
      ...f,
      assignments: (f.assignments ?? []).filter((_, i) => i !== idx),
    }));
  }

  async function save() {
    try {
      const payload = {
        ...form,
        assignments: (form.assignments ?? []).filter((a) => a.classId && a.sectionId && a.subjectId),
      };

      if (editingId) {
        await apiFetch(`/api/teachers/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Teacher updated");
      } else {
        await apiFetch("/api/teachers", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Teacher created");
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await apiFetch(`/api/teachers/${deleteId}`, { method: "DELETE" });
      toast.success("Teacher removed");
      setDeleteId(null);
      await load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Maintain faculty profiles and Clerk linkage. Assign classes through edit or import tools.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add teacher
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Faculty directory</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              className="pl-8"
              placeholder="Search name, email, employee ID..."
              value={search}
              onChange={(e) => {
                setPagination((p) => ({ ...p, page: 1 }));
                setSearch(e.target.value);
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Assignments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No teachers found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell className="font-medium">
                      {row.firstName} {row.lastName}
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.employeeId || "—"}</TableCell>
                    <TableCell>{row.assignments?.length ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(row._id)}>
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              Page {pagination.page} of {pagination.pages} · {pagination.total} records
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit teacher" : "New teacher"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label>First name</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label>Last name</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label>Employee ID</Label>
                <Input
                  value={form.employeeId}
                  onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Clerk user ID</Label>
              <Input
                placeholder="user_..."
                value={form.clerkUserId}
                onChange={(e) => setForm((f) => ({ ...f, clerkUserId: e.target.value }))}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Class-section-subject assignments</Label>
                <Button type="button" size="sm" variant="outline" onClick={addAssignment}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add assignment
                </Button>
              </div>
              {(form.assignments ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No assignments yet. Add at least one pair to map this teacher to classes and subjects.
                </p>
              ) : (
                <div className="space-y-2">
                  {(form.assignments ?? []).map((assignment, idx) => (
                    <div
                      key={`${idx}-${assignment.classId}-${assignment.sectionId}-${assignment.subjectId}`}
                      className="grid gap-2 sm:grid-cols-12">
                      <div className="sm:col-span-4">
                        {(() => {
                          const selectedClass = classes.find((c) => String(c._id) === assignment.classId);
                          const selectedClassLabel = selectedClass ? getClassLabel(selectedClass) : "";
                          return (
                        <Select
                          value={assignment.classId || ""}
                          onValueChange={(v) => {
                            updateAssignment(idx, "classId", v);
                            updateAssignment(idx, "sectionId", "");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue>
                              {selectedClassLabel || "Select class"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((c) => (
                              <SelectItem key={c._id} value={String(c._id)}>
                                {getClassLabel(c)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                          );
                        })()}
                      </div>
                      <div className="sm:col-span-3">
                        {(() => {
                          const filteredSections = sections.filter(
                            (s) => !assignment.classId || String(s.classId) === assignment.classId
                          );
                          const selectedSection = filteredSections.find(
                            (s) => String(s._id) === assignment.sectionId
                          );
                          const selectedSectionLabel = selectedSection
                            ? getSectionLabel(selectedSection)
                            : "";
                          return (
                        <Select
                          value={assignment.sectionId || ""}
                          onValueChange={(v) => updateAssignment(idx, "sectionId", v)}
                        >
                          <SelectTrigger>
                            <SelectValue>
                              {selectedSectionLabel || "Select section"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {filteredSections.map((s) => (
                                <SelectItem key={s._id} value={String(s._id)}>
                                  {getSectionLabel(s)}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                          );
                        })()}
                      </div>
                      <div className="sm:col-span-3">
                        {(() => {
                          const selectedSubject = subjects.find(
                            (s) => String(s._id) === assignment.subjectId
                          );
                          const selectedSubjectLabel = selectedSubject
                            ? getSubjectLabel(selectedSubject)
                            : "";
                          return (
                        <Select
                          value={assignment.subjectId || ""}
                          onValueChange={(v) => updateAssignment(idx, "subjectId", v)}
                        >
                          <SelectTrigger>
                            <SelectValue>
                              {selectedSubjectLabel || "Select subject"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((s) => (
                              <SelectItem key={s._id} value={String(s._id)}>
                                {getSubjectLabel(s)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                          );
                        })()}
                      </div>
                      <div className="sm:col-span-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={() => removeAssignment(idx)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete teacher?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the teacher profile from the directory. Historical marks remain stored by ids.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
