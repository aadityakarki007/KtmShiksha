"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/auth/user-nav";
import { Separator } from "@/components/ui/separator";

function NavIcon({ name, className }) {
  const Cmp = Icons[name];
  if (!Cmp) return null;
  return <Cmp className={className} />;
}

export function DashboardShell({ title, navItems, children }) {
  const pathname = usePathname();

  const Links = ({ onNavigate }) => (
    <div className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <NavIcon name={item.icon} className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <aside className="bg-sidebar text-sidebar-foreground hidden w-64 shrink-0 border-r lg:block">
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="bg-sidebar-primary text-sidebar-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold">
              KS
            </span>
            <span className="leading-tight">{title}</span>
          </Link>
        </div>
        <div className="p-3">
          <Links />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background flex h-16 items-center justify-between gap-4 border-b px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    className="lg:hidden"
                    variant="outline"
                    size="icon"
                    aria-label="Open navigation"
                  />
                }>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <div className="mt-10">
                  <p className="text-muted-foreground mb-4 px-1 text-xs font-semibold uppercase tracking-wide">
                    Menu
                  </p>
                  <Links />
                </div>
              </SheetContent>
            </Sheet>
            <div className="hidden min-w-0 lg:block">
              <p className="text-muted-foreground truncate text-xs uppercase tracking-wide">{title}</p>
              <p className="truncate font-semibold tracking-tight">Kathmandu Shikshyalaya</p>
            </div>
          </div>
          <UserNav />
        </header>
        <Separator />
        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
