import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SitePageShell } from "@/components/site/site-page-shell";
import { CAMPUS_ADDRESS_INLINE, SCHOOL_LEADERSHIP } from "@/lib/school-site";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <SitePageShell
      title="About Kathmandu Shikshyalaya"
      description={`We are rooted in ${CAMPUS_ADDRESS_INLINE}, serving families across the valley with Montessori through Grade 10.`}
    >
      <div className="max-w-3xl space-y-4 text-muted-foreground text-lg leading-relaxed">
        <p>
          Kathmandu Shikshyalaya is dedicated to cultivating confident, compassionate learners across
          Montessori, Nursery, LKG, UKG, and Grades 1–10. Our educators partner closely with families to
          uphold academic excellence while honoring each child&apos;s voice and pace.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card className="border-sky-500/15 bg-card/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:bg-card/50">
          <CardHeader>
            <CardTitle>Our mission</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">
            Empower students with knowledge, integrity, and resilience through rigorous academics,
            experiential learning, and community engagement grounded in Nepali values and global outlook.
          </CardContent>
        </Card>
        <Card className="border-emerald-500/15 bg-card/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:bg-card/50">
          <CardHeader>
            <CardTitle>Our vision</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">
            Graduate lifelong learners who lead with empathy, think critically, and contribute meaningfully to
            Nepal and the wider world.
          </CardContent>
        </Card>
      </div>

      <div className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight">Leadership</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          Governance and academic leadership guiding Kathmandu Shikshyalaya.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {SCHOOL_LEADERSHIP.map((entry) => (
            <Card
              key={entry.role}
              className="border-border/80 bg-card/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:bg-card/50"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-muted-foreground">{entry.role}</CardTitle>
              </CardHeader>
              <CardContent className="text-lg font-semibold tracking-tight text-foreground">{entry.name}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SitePageShell>
  );
}
