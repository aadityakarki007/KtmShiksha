"use client";

import { cn } from "@/lib/utils";

export function StudentPageIntro({ title, description, className }) {
  return (
    <div
      className={cn(
        "mb-6 rounded-2xl border border-border/60 bg-gradient-to-br from-amber-50/35 via-background to-sky-50/30 p-5 shadow-sm dark:from-amber-950/12 dark:via-background dark:to-sky-950/12 md:p-6",
        className
      )}
    >
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">{description}</p>
    </div>
  );
}
