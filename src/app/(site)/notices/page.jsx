import { format } from "date-fns";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Notice from "@/models/Notice";
import { resolveRole } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SitePageShell } from "@/components/site/site-page-shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Notices",
};

async function buildAudienceFilter() {
  const user = await currentUser();
  if (!user) {
    return { audience: "all" };
  }

  const role = resolveRole(user.publicMetadata);

  if (role === "admin") {
    return {};
  }
  if (role === "student") {
    return { $or: [{ audience: "all" }, { audience: "students" }] };
  }
  if (role === "teacher") {
    return { $or: [{ audience: "all" }, { audience: "teachers" }] };
  }

  return { audience: "all" };
}

export default async function NoticesPublicPage() {
  await connectDB();
  const audienceFilter = await buildAudienceFilter();

  const notices = await Notice.find(audienceFilter)
    .sort({ pinned: -1, publishedAt: -1 })
    .limit(50)
    .lean();

  return (
    <SitePageShell
      title="School notices"
      description="Official updates for families and staff. Sign in to see notices targeted to your role."
    >
      <div className="flex flex-col gap-4">
        {notices.length === 0 ? (
          <p className="text-muted-foreground text-sm">No notices published yet.</p>
        ) : (
          notices.map((n) => (
            <Card
              key={String(n._id)}
              className={`border-l-4 bg-card/90 transition-all duration-300 hover:shadow-md dark:bg-card/50 ${
                n.pinned ? "border-l-amber-500/70" : "border-l-border/40"
              }`}
            >
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl">{n.title}</CardTitle>
                  {n.pinned && <Badge>Pinned</Badge>}
                  <Badge variant="secondary" className="capitalize">
                    {n.audience}
                  </Badge>
                </div>
                <CardDescription>
                  {n.publishedAt
                    ? format(new Date(n.publishedAt), "MMMM d, yyyy")
                    : "Recently posted"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{n.body}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </SitePageShell>
  );
}
