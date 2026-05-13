import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admissions",
};

export default function AdmissionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Admissions</h1>
      <p className="text-muted-foreground mt-3 max-w-3xl text-lg leading-relaxed">
        We welcome applications across Montessori through Grade 10. Complete the inquiry steps below and
        our admissions office will guide your family through assessments and enrollment.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          { step: "01", title: "Campus tour", body: "Experience classrooms and meet faculty." },
          { step: "02", title: "Application", body: "Submit forms and prior academic records." },
          { step: "03", title: "Placement", body: "Friendly readiness conversation and grade placement." },
        ].map((item) => (
          <Card key={item.step}>
            <CardHeader>
              <p className="text-primary text-xs font-bold">{item.step}</p>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed">{item.body}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Button asChild size="lg">
          <Link href="/contact">Contact admissions</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/notices">Read enrollment notices</Link>
        </Button>
      </div>
    </div>
  );
}
