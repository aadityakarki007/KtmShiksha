import { cn } from "@/lib/utils";

export function SitePageShell({ title, description, children, className }) {
  return (
    <div className={cn("min-h-[40vh]", className)}>
      <div className="border-b border-border/60 bg-gradient-to-b from-sky-50/45 via-background to-background pb-10 pt-14 dark:from-sky-950/20 dark:via-background dark:to-background md:pb-12 md:pt-16">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-4xl font-semibold tracking-tight text-balance">{title}</h1>
          {description ? (
            <p className="text-muted-foreground mt-3 max-w-3xl text-lg leading-relaxed">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">{children}</div>
    </div>
  );
}
