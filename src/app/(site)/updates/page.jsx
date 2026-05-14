import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { connectDB } from "@/lib/mongodb";
import Update from "@/models/Update";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SitePageShell } from "@/components/site/site-page-shell";

export const metadata = {
  title: "Updates",
};

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  await connectDB();
  const updates = await Update.find()
    .sort({ pinned: -1, publishedAt: -1 })
    .limit(50)
    .lean();

  return (
    <SitePageShell
      title="School updates"
      description="Photos and news from Kathmandu Shikshyalaya—shared for families and visitors."
    >
      <div className="flex flex-col gap-6">
        {updates.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed px-4 py-10 text-center text-sm">
            No updates yet. Please check back soon.
          </p>
        ) : (
          updates.map((update) => (
            <Card
              key={String(update._id)}
              id={String(update._id)}
              className={`scroll-mt-24 overflow-hidden border-l-4 bg-card/90 transition-all duration-300 hover:shadow-md dark:bg-card/50 ${
                update.pinned ? "border-l-amber-500/70" : "border-l-border/50"
              }`}
            >
              {update.imageUrl ? (
                <div className="border-b bg-muted/20">
                  <div className="relative aspect-[21/9] max-h-80 w-full md:aspect-[2.4/1]">
                    {update.imageUrl.startsWith("https://") ? (
                      <Image
                        src={update.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 1152px"
                        priority={false}
                      />
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element -- legacy data URLs */}
                        <img src={update.imageUrl} alt="" className="h-full w-full object-cover" />
                      </>
                    )}
                  </div>
                </div>
              ) : null}
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-2xl">{update.title}</CardTitle>
                  {update.pinned ? <Badge>Pinned</Badge> : null}
                </div>
                <CardDescription>
                  {format(new Date(update.publishedAt), "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{update.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <p className="text-muted-foreground mt-10 text-center text-sm">
        Looking for official notices?{" "}
        <Link href="/notices" className="text-primary font-medium underline-offset-4 hover:underline">
          View notices
        </Link>
      </p>
    </SitePageShell>
  );
}
