import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="max-w-3xl space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">About Kathmandu Shikshyalaya</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Kathmandu Shikshyalaya is dedicated to cultivating confident, compassionate learners across
          Montessori, Nursery, LKG, UKG, and Grades 1–10. Our educators partner closely with families to
          uphold academic excellence while honoring each child&apos;s voice and pace.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Our mission</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">
            Empower students with knowledge, integrity, and resilience through rigorous academics,
            experiential learning, and community engagement grounded in Nepali values and global outlook.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Our vision</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">
            Graduate lifelong learners who lead with empathy, think critically, and contribute meaningfully to
            Nepal and the wider world.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
