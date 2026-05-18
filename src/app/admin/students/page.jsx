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
import { selectItemsById } from "@/lib/select-items";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  rollNumber: "",
  gender: "",
  address: "",
  parentName: "",
  parentPhone: "",
  classId: "",
  sectionId: "",
  clerkUserId: "",
};

export default function AdminStudentsPage() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [search, setSearch] = useState("");
  const [filterClassId, setFilterClassId] = useState(""); // NEW
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
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
    if (filterClassId) params.set("classId", filterClassId); // NEW
    return params.toString();
  }, [pagination.page, pagination.limit, search, filterClassId]);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/students?${queryString}`);
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
        const c = await apiFetch("/api/classes?limit=200");
        setClasses(c.data);
      } catch {
        /* ignore */
      }
    }
    loadRefs();
  }, []);

  useEffect(() => {
    async function loadSections() {
      if (!form.classId) {
        setSections([]);
        return;
      }
      try {
        const s = await apiFetch(`/api/sections?classId=${form.classId}&limit=200`);
        setSections(s.data);
      } catch {
        setSections([]);
      }
    }
    loadSections();
  }, [form.classId]);

  const classSelectItems = useMemo(
    () => selectItemsById(classes, (c) => `${c.name} (${c.level})`),
    [classes]
  );
  const sectionSelectItems = useMemo(
    () => selectItemsById(sections, (s) => s.name),
    [sections]
  );

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(row) {
    setEditingId(row._id);
    setForm({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email ?? "",
      rollNumber: row.rollNumber ?? "",
      gender: row.gender ?? "",
      address: row.address ?? "",
      parentName: row.parentName ?? "",
      parentPhone: row.parentPhone ?? "",
      classId: String(row.classId?._id ?? row.classId),
      sectionId: String(row.sectionId?._id ?? row.sectionId),
      clerkUserId: row.clerkUserId ?? "",
    });
    setDialogOpen(true);
  }

  async function save() {
    try {
      if (editingId) {
        await apiFetch(`/api/students/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        toast.success("Student updated");
      } else {
        await apiFetch("/api/students", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast.success("Student created");
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
      await apiFetch(`/api/students/${deleteId}`, { method: "DELETE" });
      toast.success("Student removed");
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
          <h1 className="text-3xl font-semibold tracking-tight">Students</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage enrollment, class placement, and guardian contacts.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add student
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Directory</CardTitle>
          {/* FILTER ROW */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Class filter */}
            <Select
              value={filterClassId || "all"}
              onValueChange={(v) => {
                setFilterClassId(v === "all" ? "" : v);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c._id} value={String(c._id)}>
                    {c.name} ({c.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                className="pl-8"
                placeholder="Search name, email, roll..."
                value={search}
                onChange={(e) => {
                  setPagination((p) => ({ ...p, page: 1 }));
                  setSearch(e.target.value);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Roll</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
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
                    {filterClassId
                      ? "No students in this class."
                      : "No students found."}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell className="font-medium">
                      {row.firstName} {row.lastName}
                    </TableCell>
                    <TableCell>{row.rollNumber || "—"}</TableCell>
                    <TableCell>{row.classId?.name ?? "—"}</TableCell>
                    <TableCell>{row.sectionId?.name ?? "—"}</TableCell>
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

      {/* ── Create / Edit dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit student" : "New student"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label htmlFor="roll">Roll number</Label>
                <Input
                  id="roll"
                  value={form.rollNumber}
                  onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Class</Label>
              <Select
                value={form.classId}
                onValueChange={(v) => setForm((f) => ({ ...f, classId: v, sectionId: "" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c._id} value={String(c._id)}>
                      {c.name} ({c.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Section</Label>
              <Select
                value={form.sectionId}
                onValueChange={(v) => setForm((f) => ({ ...f, sectionId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose section" />
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
            <div>
              <Label htmlFor="parent">Parent / guardian</Label>
              <Input
                id="parent"
                value={form.parentName}
                onChange={(e) => setForm((f) => ({ ...f, parentName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="parentPhone">Parent phone</Label>
              <Input
                id="parentPhone"
                value={form.parentPhone}
                onChange={(e) => setForm((f) => ({ ...f, parentPhone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="clerk">Clerk user ID (optional)</Label>
              <Input
                id="clerk"
                placeholder="user_..."
                value={form.clerkUserId}
                onChange={(e) => setForm((f) => ({ ...f, clerkUserId: e.target.value }))}
              />
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

      {/* ── Delete confirmation ── */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete student?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the student record. You can restore data only through a backup.
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