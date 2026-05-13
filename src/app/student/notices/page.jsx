"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentNoticesPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch("/api/notices?limit=50");
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
        <h1 className="text-3xl font-semibold tracking-tight">Notices for students</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          School-wide and learner-focused announcements appear here when you are signed in.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {rows.map((n) => (
          <Card key={n._id}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl">{n.title}</CardTitle>
                <Badge variant="secondary" className="capitalize">
                  {n.audience}
                </Badge>
              </div>
              <CardDescription>
                {n.publishedAt ? format(new Date(n.publishedAt), "MMMM d, yyyy") : "Posted"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{n.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
