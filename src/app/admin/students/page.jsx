"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/client-api";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  rollNumber: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  parentName: "",
  parentPhone: "",
  house: "",
  emisId: "",
  classId: "",
  sectionId: "",
  clerkUserId: "",
};

export default function AdminStudentsPage() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [search, setSearch] = useState("");
  const [filterClassId, setFilterClassId] = useState("");
  const [filterSectionId, setFilterSectionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [filterSections, setFilterSections] = useState([]);
  const [formSections, setFormSections] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
    });
    if (search.trim()) params.set("search", search.trim());
    if (filterClassId) params.set("classId", filterClassId);
    if (filterSectionId) params.set("sectionId", filterSectionId);
    return params.toString();
  }, [pagination.page, pagination.limit, search, filterClassId, filterSectionId]);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/students?${queryString}`);
      setRows(
        [...data.data].sort((a, b) => {
          const na = parseInt(a.rollNumber, 10);
          const nb = parseInt(b.rollNumber, 10);
          if (!isNaN(na) && !isNaN(nb)) return na - nb;
          return (a.rollNumber ?? "").localeCompare(b.rollNumber ?? "");
        })
      );
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
    async function loadClasses() {
      try {
        const c = await apiFetch("/api/classes?limit=200");
        setClasses(c.data);
      } catch { /* ignore */ }
    }
    loadClasses();
  }, []);

  // Sections for the filter bar
  useEffect(() => {
    async function loadFilterSections() {
      if (!filterClassId) { setFilterSections([]); setFilterSectionId(""); return; }
      try {
        const s = await apiFetch(`/api/sections?classId=${filterClassId}&limit=200`);
        setFilterSections(s.data);
      } catch { setFilterSections([]); }
    }
    loadFilterSections();
  }, [filterClassId]);

  // Sections for the create/edit form
  useEffect(() => {
    async function loadFormSections() {
      if (!form.classId) { setFormSections([]); return; }
      try {
        const s = await apiFetch(`/api/sections?classId=${form.classId}&limit=200`);
        setFormSections(s.data);
      } catch { setFormSections([]); }
    }
    loadFormSections();
  }, [form.classId]);

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
      dateOfBirth: row.dateOfBirth ? row.dateOfBirth.split("T")[0] : "",
      gender: row.gender ?? "",
      address: row.address ?? "",
      parentName: row.parentName ?? "",
      parentPhone: row.parentPhone ?? "",
      house: row.house ?? "",
      emisId: row.emisId ?? "",
      classId: String(row.classId?._id ?? row.classId),
      sectionId: String(row.sectionId?._id ?? row.sectionId),
      clerkUserId: row.clerkUserId ?? "",
    });
    setDialogOpen(true);
  }

  async function save() {
    try {
      if (editingId) {
        await apiFetch(`/api/students/${editingId}`, { method: "PATCH", body: JSON.stringify(form) });
        toast.success("Student updated");
      } else {
        await apiFetch("/api/students", { method: "POST", body: JSON.stringify(form) });
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

  const selectedClassName = useMemo(() => {
    if (!filterClassId) return null;
    const c = classes.find((c) => String(c._id) === filterClassId);
    return c ? `${c.name} (${c.level})` : null;
  }, [filterClassId, classes]);

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
          <div>
            <CardTitle>
              {selectedClassName ? selectedClassName : "All Students"}
            </CardTitle>
            {!filterClassId && (
              <p className="text-muted-foreground text-xs mt-1">Select a class to view students</p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Class filter */}
            <Select
              value={filterClassId || "all"}
              onValueChange={(v) => {
                setFilterClassId(v === "all" ? "" : v);
                setFilterSectionId("");
                setPagination((p) => ({ ...p, page: 1 }));
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select class" />
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

            {/* Section filter — only when class is picked */}
            {filterClassId && (
              <Select
                value={filterSectionId || "all"}
                onValueChange={(v) => {
                  setFilterSectionId(v === "all" ? "" : v);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sections</SelectItem>
                  {filterSections.map((s) => (
                    <SelectItem key={s._id} value={String(s._id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                className="pl-8"
                placeholder="Search name, roll..."
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
          {!filterClassId && !search.trim() ? (
            <div className="text-muted-foreground py-16 text-center text-sm">
              Please select a class from the dropdown above to view students.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Roll</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">Loading…</TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">No students found.</TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row._id}>
                        <TableCell className="font-mono text-sm">{row.rollNumber || "—"}</TableCell>
                        <TableCell className="font-medium">
                          {row.firstName} {row.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{row.sectionId?.name ?? "—"}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{row.parentName || "—"}</TableCell>
                        <TableCell className="text-sm">{row.parentPhone || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => setViewStudent(row)} title="View details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(row)} title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(row._id)} title="Delete">
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
                  Page {pagination.page} of {pagination.pages} · {pagination.total} students
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={pagination.page <= 1}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── View student details dialog ── */}
      <Dialog open={!!viewStudent} onOpenChange={() => setViewStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {viewStudent && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 pb-2 border-b">
                <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold">
                  {viewStudent.firstName[0]}{viewStudent.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-base">{viewStudent.firstName} {viewStudent.lastName}</p>
                  <p className="text-muted-foreground">Roll No: {viewStudent.rollNumber || "—"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div><p className="text-muted-foreground text-xs">Class</p><p className="font-medium">{viewStudent.classId?.name ?? "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Section</p><p className="font-medium">{viewStudent.sectionId?.name ?? "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Date of Birth</p><p className="font-medium">{viewStudent.dateOfBirth ? new Date(viewStudent.dateOfBirth).toLocaleDateString() : "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Gender</p><p className="font-medium">{viewStudent.gender || "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">House</p><p className="font-medium">{viewStudent.house || "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">EMIS ID</p><p className="font-medium">{viewStudent.emisId || "—"}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground text-xs">Address</p><p className="font-medium">{viewStudent.address || "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Parent / Guardian</p><p className="font-medium">{viewStudent.parentName || "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Parent Phone</p><p className="font-medium">{viewStudent.parentPhone || "—"}</p></div>
                {viewStudent.email && (
                  <div className="col-span-2"><p className="text-muted-foreground text-xs">Email</p><p className="font-medium">{viewStudent.email}</p></div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewStudent(null)}>Close</Button>
            <Button onClick={() => { setViewStudent(null); openEdit(viewStudent); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Input id="firstName" value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label htmlFor="roll">Roll number</Label>
                <Input id="roll" value={form.rollNumber}
                  onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="dob">Date of birth</Label>
                <Input id="dob" type="date" value={form.dateOfBirth}
                  onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input id="gender" value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="house">House</Label>
                <Input id="house" value={form.house}
                  onChange={(e) => setForm((f) => ({ ...f, house: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="emisId">EMIS ID</Label>
              <Input id="emisId" value={form.emisId}
                onChange={(e) => setForm((f) => ({ ...f, emisId: e.target.value }))} />
            </div>
            <div>
              <Label>Class</Label>
              <Select value={form.classId}
                onValueChange={(v) => setForm((f) => ({ ...f, classId: v, sectionId: "" }))}>
                <SelectTrigger><SelectValue placeholder="Choose class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c._id} value={String(c._id)}>{c.name} ({c.level})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Section</Label>
              <Select value={form.sectionId} onValueChange={(v) => setForm((f) => ({ ...f, sectionId: v }))}>
                <SelectTrigger><SelectValue placeholder="Choose section" /></SelectTrigger>
                <SelectContent>
                  {formSections.map((s) => (
                    <SelectItem key={s._id} value={String(s._id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="parent">Parent / guardian</Label>
              <Input id="parent" value={form.parentName}
                onChange={(e) => setForm((f) => ({ ...f, parentName: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="parentPhone">Parent phone</Label>
              <Input id="parentPhone" value={form.parentPhone}
                onChange={(e) => setForm((f) => ({ ...f, parentPhone: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="clerk">Clerk user ID (optional)</Label>
              <Input id="clerk" placeholder="user_..." value={form.clerkUserId}
                onChange={(e) => setForm((f) => ({ ...f, clerkUserId: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
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