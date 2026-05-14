"use client";

import Link from "next/link";
import { CalendarCheck, GraduationCap, LayoutGrid } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Rise({ className, delayClass, children }) {
  return <div className={cn("animate-ks-rise-in", delayClass, className)}>{children}</div>;
}

export function StudentOverview({ summary }) {
  if (!summary) {
    return (
      <div className="space-y-8">
        <Rise>
          <h1 className="text-3xl font-semibold tracking-tight">Hello</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
            Track attendance, assessments, and announcements tailored for you.
          </p>
        </Rise>
        <Rise delayClass="[animation-delay:90ms]">
          <Card className="border-dashed transition-shadow duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Link your enrollment</CardTitle>
              <CardDescription>
                We could not find a student profile connected to this login. Please contact the registrar if you
                believe this is an error.
              </CardDescription>
            </CardHeader>
          </Card>
        </Rise>
      </div>
    );
  }

  const { firstName, className, classLevel, sectionName } = summary;

  return (
    <div className="space-y-8">
      <Rise className="rounded-2xl border border-border/60 bg-gradient-to-br from-amber-50/40 via-background to-sky-50/35 p-6 shadow-sm dark:from-amber-950/15 dark:via-background dark:to-sky-950/15">
        <div className="flex flex-wrap items-start gap-4">
          <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-105">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold tracking-tight">Hello, {firstName}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
              Track attendance, assessments, and announcements tailored for you.
            </p>
          </div>
        </div>
      </Rise>

      <div className="grid gap-6 md:grid-cols-3">
        <Rise delayClass="[animation-delay:70ms]">
          <Card className="h-full border-emerald-500/15 bg-gradient-to-b from-card to-emerald-50/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:to-emerald-950/10">
            <CardHeader>
              <div className="text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                <CardTitle className="text-lg">Class</CardTitle>
              </div>
              <CardDescription>Your homeroom placement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-semibold">{className}</p>
              <p className="text-muted-foreground">{classLevel}</p>
              <p>
                Section <span className="font-medium">{sectionName}</span>
              </p>
            </CardContent>
          </Card>
        </Rise>

        <Rise delayClass="[animation-delay:140ms]" className="md:col-span-2">
          <Card className="h-full border-sky-500/15 bg-gradient-to-b from-card to-sky-50/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:to-sky-950/10">
            <CardHeader>
              <div className="text-sky-700 dark:text-sky-400 mb-1 flex items-center gap-2">
                <CalendarCheck className="h-4 w-4" />
                <CardTitle className="text-lg">Quick links</CardTitle>
              </div>
              <CardDescription>Jump to detailed views</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button asChild variant="secondary" className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <Link href="/student/attendance">Attendance history</Link>
              </Button>
              <Button asChild variant="outline" className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <Link href="/student/marks">Marks & reports</Link>
              </Button>
              <Button asChild variant="outline" className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <Link href="/student/notices">Notices</Link>
              </Button>
            </CardContent>
          </Card>
        </Rise>
      </div>
    </div>
  );
}
