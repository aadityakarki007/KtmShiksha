"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentPageIntro } from "@/components/student/student-page-intro";

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
      <StudentPageIntro
        title="Notices for students"
        description="School-wide and learner-focused announcements appear here when you are signed in."
      />

      <div className="flex flex-col gap-4">
        {!rows.length ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed px-4 py-8 text-center text-sm">
            No notices for you yet. Check back later or browse public notices on the school site.
          </p>
        ) : null}
        {rows.map((n) => (
          <Card
            key={n._id}
            className="border-amber-500/12 bg-card/95 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-amber-900/25 dark:bg-card/50"
          >
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
