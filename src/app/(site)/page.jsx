import Link from "next/link";
import { ArrowRight, BookOpen, HeartHandshake, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div>
      <section className="from-primary/10 via-background to-muted/40 relative overflow-hidden bg-gradient-to-br">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 md:flex-row md:items-center md:py-28">
          <div className="flex-1 space-y-6">
            <p className="text-primary inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              Kathmandu Shikshyalaya
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Nurturing curious minds from Montessori through Grade 10
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
              A welcoming community where academic rigor meets creativity, character, and care—preparing
              students to thrive in Nepal and beyond.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/admissions">
                  Plan a visit <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">Discover our story</Link>
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle>Holistic learning pathways</CardTitle>
                <CardDescription>
                  Montessori foundations through secondary pathways aligned with national standards.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-card p-4">
                  <BookOpen className="text-primary mb-2 h-6 w-6" />
                  <p className="font-medium">Academic depth</p>
                  <p className="text-muted-foreground text-sm">STEM, languages, and inquiry-led classrooms.</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <HeartHandshake className="text-primary mb-2 h-6 w-6" />
                  <p className="font-medium">Whole-child care</p>
                  <p className="text-muted-foreground text-sm">Arts, athletics, service, and wellbeing.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">Why families choose us</h2>
          <p className="text-muted-foreground mt-2">
            Trusted educators, structured progression across early years and grades, and transparent
            communication with families.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Experienced faculty",
              body: "Mentors who blend compassion with high expectations for every learner.",
            },
            {
              title: "Safe, vibrant campus",
              body: "Spaces designed for exploration—from Montessori corners to modern labs.",
            },
            {
              title: "Future-ready skills",
              body: "Digital literacy, collaboration, and leadership woven across grade levels.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
