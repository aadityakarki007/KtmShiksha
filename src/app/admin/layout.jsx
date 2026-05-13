import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { resolveRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ADMIN_NAV } from "@/lib/nav-config";

export default async function AdminLayout({ children }) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  if (resolveRole(user.publicMetadata) !== "admin") {
    redirect("/");
  }

  return (
    <DashboardShell title="Admin console" navItems={ADMIN_NAV}>
      {children}
    </DashboardShell>
  );
}
