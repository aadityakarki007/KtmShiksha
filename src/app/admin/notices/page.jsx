"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client-api";
import { NOTICE_AUDIENCES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function AdminNoticesPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    title: "",
    body: "",
    audience: "all",
    pinned: false,
  });

  async function load() {
    try {
      const res = await apiFetch("/api/notices?limit=100");
      setRows(res.data);
    } catch (e) {
      toast.error(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    try {
      await apiFetch("/api/notices", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Notice published");
      setForm({ title: "", body: "", audience: "all", pinned: false });
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function remove(id) {
    try {
      await apiFetch(`/api/notices/${id}`, { method: "DELETE" });
      toast.success("Notice deleted");
      await load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Notices</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Broadcast updates to the entire community or tailor visibility by audience.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create notice</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={create}>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea
                required
                rows={5}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select
                  value={form.audience}
                  onValueChange={(v) => setForm((f) => ({ ...f, audience: v }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTICE_AUDIENCES.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Checkbox
                  id="pin"
                  checked={form.pinned}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, pinned: !!v }))}
                />
                <Label htmlFor="pin">Pin notice</Label>
              </div>
            </div>
            <Button type="submit">Publish</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Published</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Pinned</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((n) => (
                <TableRow key={n._id}>
                  <TableCell className="font-medium">{n.title}</TableCell>
                  <TableCell className="capitalize">{n.audience}</TableCell>
                  <TableCell>{n.pinned ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => remove(n._id)}>
                      Delete
                    </Button>
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
