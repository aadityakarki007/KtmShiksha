"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { GraduationCap, LayoutDashboard, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

function resolveRole(metadata) {
  const role = metadata?.role;
  if (role === "admin" || role === "teacher" || role === "student") {
    return role;
  }
  return "student";
}

export function UserNav() {
  const { isSignedIn, user } = useUser();
  const role = resolveRole(user?.publicMetadata);

  if (!isSignedIn) {
    return (
      <Button size="sm" variant="default" asChild>
        <Link href="/sign-in">Login</Link>
      </Button>
    );
  }

  return (
    <UserButton afterSignOutUrl="/">
      <UserButton.MenuItems>
        {role === "admin" && (
          <UserButton.Link
            label="Admin dashboard"
            href="/admin"
            labelIcon={<Shield className="h-4 w-4 text-emerald-700" />}
          />
        )}
        {role === "teacher" && (
          <UserButton.Link
            label="Teacher dashboard"
            href="/teacher"
            labelIcon={<Users className="h-4 w-4 text-sky-700" />}
          />
        )}
        {role === "student" && (
          <UserButton.Link
            label="Student portal"
            href="/student"
            labelIcon={<GraduationCap className="h-4 w-4 text-amber-700" />}
          />
        )}
        <UserButton.Link
          label="Public website"
          href="/"
          labelIcon={<LayoutDashboard className="h-4 w-4 text-muted-foreground" />}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
