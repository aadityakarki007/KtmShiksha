import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { resolveRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TEACHER_NAV } from "@/lib/nav-config";

export default async function TeacherLayout({ children }) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  if (resolveRole(user.publicMetadata) !== "teacher") {
    redirect("/");
  }

  return (
    <DashboardShell title="Teacher workspace" navItems={TEACHER_NAV}>
      {children}
    </DashboardShell>
  );
}
