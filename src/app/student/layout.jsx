import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { resolveRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { STUDENT_NAV } from "@/lib/nav-config";

export default async function StudentLayout({ children }) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  if (resolveRole(user.publicMetadata) !== "student") {
    redirect("/");
  }

  return (
    <DashboardShell title="Student portal" navItems={STUDENT_NAV}>
      {children}
    </DashboardShell>
  );
}
