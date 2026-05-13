"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/auth/user-nav";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/admissions", label: "Admissions" },
  { href: "/notices", label: "Notices" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();

  const NavLinks = ({ mobile = false }) => (
    <nav
      className={cn(
        "flex gap-6",
        mobile ? "flex-col text-lg" : "hidden items-center md:flex"
      )}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "hover:text-primary text-sm font-medium transition-colors",
            pathname === link.href ? "text-primary" : "text-muted-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground size-8">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px]">
              <div className="mt-8 flex flex-col gap-6">
                <NavLinks mobile />
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold shadow-sm">
              KS
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="text-sm font-semibold tracking-tight">Kathmandu Shikshyalaya</span>
              <span className="text-muted-foreground text-xs">Excellence in education</span>
            </span>
          </Link>
        </div>
        <NavLinks />
        <UserNav />
      </div>
    </header>
  );
}
