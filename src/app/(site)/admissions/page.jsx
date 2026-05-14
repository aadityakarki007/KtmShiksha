import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SitePageShell } from "@/components/site/site-page-shell";
import { CAMPUS_ADDRESS_INLINE } from "@/lib/school-site";

export const metadata = {
  title: "Admissions",
};

const steps = [
  { step: "01", title: "School tour", body: "Experience classrooms and meet faculty.", accent: "border-t-emerald-500/50" },
  { step: "02", title: "Application", body: "Submit forms and prior academic records.", accent: "border-t-sky-500/50" },
  { step: "03", title: "Placement", body: "Friendly readiness conversation and grade placement.", accent: "border-t-amber-500/45" },
];

export default function AdmissionsPage() {
  return (
    <SitePageShell
      title="Admissions"
      description={`We welcome applications across Montessori through Grade 10. Our school is in ${CAMPUS_ADDRESS_INLINE}. Complete the steps below and our admissions office will guide your family through assessments and enrollment.`}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((item) => (
          <Card
            key={item.step}
            className={`overflow-hidden border-t-4 bg-card/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:bg-card/50 ${item.accent}`}
          >
            <CardHeader>
              <p className="text-primary text-xs font-bold">{item.step}</p>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed">{item.body}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Button asChild size="lg" className="shadow-sm transition-shadow hover:shadow-md">
          <Link href="/contact">Contact admissions</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="transition-colors">
          <Link href="/notices">Read enrollment notices</Link>
        </Button>
      </div>
    </SitePageShell>
  );
}
