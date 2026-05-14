import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  MapPin,
  Megaphone,
  MessagesSquare,
  Newspaper,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CAMPUS_ADDRESS_LINES, CAMPUS_ADDRESS_INLINE } from "@/lib/school-site";
import { connectDB } from "@/lib/mongodb";
import Update from "@/models/Update";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const pillars = [
  {
    title: "Experienced faculty",
    body: "Mentors who blend compassion with high expectations for every learner.",
    accent: "border-t-emerald-500/55",
  },
  {
    title: "Safe, vibrant school",
    body: "Spaces designed for exploration—from Montessori corners to modern labs.",
    accent: "border-t-sky-500/55",
  },
  {
    title: "Future-ready skills",
    body: "Digital literacy, collaboration, and leadership woven across grade levels.",
    accent: "border-t-amber-500/50",
  },
];

export default async function HomePage() {
  await connectDB();
  const updates = await Update.find()
    .sort({ pinned: -1, publishedAt: -1 })
    .limit(3)
    .lean();

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50/90 via-background to-emerald-50/80 dark:from-sky-950/25 dark:via-background dark:to-emerald-950/20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-400/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-400/10"
        />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 md:flex-row md:items-center md:py-28">
          <div className="flex-1 space-y-6">
            <p className="text-primary inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm backdrop-blur-sm dark:bg-primary/12">
              <Sparkles className="h-3.5 w-3.5" />
              Kathmandu Shikshyalaya
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              Nurturing curious minds from Montessori through Grade 10
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
              A welcoming community where academic rigor meets creativity, character, and care—preparing
              students to thrive in Nepal and beyond.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-md shadow-primary/15 transition-shadow hover:shadow-lg hover:shadow-primary/20">
                <Link href="/admissions">
                  Plan a visit <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-sky-200/80 bg-background/60 backdrop-blur-sm transition-all hover:border-sky-300/90 hover:bg-background dark:border-sky-800/50 dark:hover:border-sky-700/80"
              >
                <Link href="/about">Discover our story</Link>
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <Card className="border-sky-200/40 shadow-lg shadow-sky-500/5 ring-1 ring-sky-500/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-sky-800/30 dark:ring-sky-400/10">
              <CardHeader>
                <CardTitle>Holistic learning pathways</CardTitle>
                <CardDescription>
                  Montessori foundations through secondary pathways aligned with national standards.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-500/15 bg-gradient-to-br from-card to-emerald-50/40 p-4 transition-colors duration-300 hover:border-emerald-500/25 dark:from-card dark:to-emerald-950/20">
                  <BookOpen className="mb-2 h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                  <p className="font-medium">Academic depth</p>
                  <p className="text-muted-foreground text-sm">STEM, languages, and inquiry-led classrooms.</p>
                </div>
                <div className="rounded-xl border border-sky-500/15 bg-gradient-to-br from-card to-sky-50/50 p-4 transition-colors duration-300 hover:border-sky-500/25 dark:from-card dark:to-sky-950/25">
                  <HeartHandshake className="mb-2 h-6 w-6 text-sky-700 dark:text-sky-400" />
                  <p className="font-medium">Whole-child care</p>
                  <p className="text-muted-foreground text-sm">Arts, athletics, service, and wellbeing.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t border-border/70 bg-gradient-to-b from-background via-muted/25 to-background py-16 dark:via-muted/10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="text-primary mb-2 flex items-center gap-2">
                <Newspaper className="h-5 w-5" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">From School Admin</span>
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">School updates</h2>
              <p className="text-muted-foreground mt-2">
                Recent stories and photos—managed from the admin console.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0 self-start sm:self-auto">
              <Link href="/updates">View all updates</Link>
            </Button>
          </div>
          {updates.length === 0 ? (
            <p className="text-muted-foreground rounded-2xl border border-dashed px-4 py-10 text-center text-sm">
              New photos and news will appear here.{" "}
              <Link href="/updates" className="text-primary font-medium underline-offset-4 hover:underline">
                Open the updates page
              </Link>{" "}
              anytime.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {updates.map((update) => (
                <Link
                  key={String(update._id)}
                  href={`/updates#${String(update._id)}`}
                  className="group block h-full"
                >
                  <Card
                    className={`h-full overflow-hidden transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md ${
                      update.pinned ? "border-amber-500/35 ring-1 ring-amber-500/15" : "border-border/80"
                    }`}
                  >
                    {update.imageUrl ? (
                      update.imageUrl.startsWith("https://") ? (
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">
                          <Image
                            src={update.imageUrl}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">
                          {/* eslint-disable-next-line @next/next/no-img-element -- legacy data URLs */}
                          <img
                            src={update.imageUrl}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </div>
                      )
                    ) : (
                      <div className="bg-muted/40 flex aspect-[4/3] items-center justify-center">
                        <Newspaper className="text-muted-foreground h-10 w-10 opacity-40" aria-hidden />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-lg leading-snug transition-colors group-hover:text-primary">
                          {update.title}
                        </CardTitle>
                        {update.pinned ? <Badge variant="secondary">Pinned</Badge> : null}
                      </div>
                      <CardDescription>
                        {format(new Date(update.publishedAt), "MMM d, yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">{update.content}</p>
                      <span className="text-primary mt-3 inline-flex items-center gap-1 text-xs font-medium">
                        Read full update{" "}
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border/70 bg-gradient-to-b from-muted/35 via-background to-background py-16 dark:from-muted/15">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">Why families choose us</h2>
            <p className="text-muted-foreground mt-2">
              Trusted educators, structured progression across early years and grades, and transparent
              communication with families.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((item) => (
              <Card
                key={item.title}
                className={`overflow-hidden border-t-4 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20 ${item.accent}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/70 bg-gradient-to-b from-background via-muted/25 to-background py-16 dark:via-muted/10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">Admissions, notices & contact</h2>
            <p className="text-muted-foreground mt-2 text-pretty leading-relaxed">
              Everything families need in one place—then visit us in {CAMPUS_ADDRESS_INLINE}.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="grid gap-4 sm:grid-cols-3">
              <Link href="/admissions" className="group block h-full">
                <Card className="h-full border-emerald-500/20 bg-card/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/35 hover:shadow-md dark:bg-card/50">
                  <CardHeader className="pb-2">
                    <UserPlus className="mb-2 h-8 w-8 text-emerald-600 opacity-90 transition-transform duration-300 group-hover:scale-105 dark:text-emerald-400" />
                    <CardTitle className="text-lg">Admissions</CardTitle>
                    <CardDescription>Tours, applications, and placement.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <span className="text-primary inline-flex items-center gap-1 text-sm font-medium">
                      Learn more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/notices" className="group block h-full">
                <Card className="h-full border-sky-500/20 bg-card/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-500/35 hover:shadow-md dark:bg-card/50">
                  <CardHeader className="pb-2">
                    <Megaphone className="mb-2 h-8 w-8 text-sky-600 opacity-90 transition-transform duration-300 group-hover:scale-105 dark:text-sky-400" />
                    <CardTitle className="text-lg">Notices</CardTitle>
                    <CardDescription>Official updates for families.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <span className="text-primary inline-flex items-center gap-1 text-sm font-medium">
                      View notices <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/contact" className="group block h-full">
                <Card className="h-full border-amber-500/20 bg-card/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500/35 hover:shadow-md dark:bg-card/50">
                  <CardHeader className="pb-2">
                    <MessagesSquare className="mb-2 h-8 w-8 text-amber-600 opacity-90 transition-transform duration-300 group-hover:scale-105 dark:text-amber-400" />
                    <CardTitle className="text-lg">Contact</CardTitle>
                    <CardDescription>Reach the front office or admissions.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <span className="text-primary inline-flex items-center gap-1 text-sm font-medium">
                      Get in touch <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </div>
            <Card className="border-border/80 bg-gradient-to-br from-card to-muted/30 shadow-sm ring-1 ring-border/50 dark:from-card dark:to-muted/10">
              <CardHeader>
                <div className="text-primary flex items-center gap-2">
                  <MapPin className="h-5 w-5 shrink-0" />
                  <CardTitle className="text-lg">Visit the school</CardTitle>
                </div>
                <CardDescription className="text-base leading-relaxed text-foreground/85">
                  {CAMPUS_ADDRESS_LINES.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/contact">Directions & hours</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admissions">Plan a visit</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
