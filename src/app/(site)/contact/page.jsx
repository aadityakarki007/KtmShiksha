import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SitePageShell } from "@/components/site/site-page-shell";
import { CAMPUS_ADDRESS_LINES } from "@/lib/school-site";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <SitePageShell
      title="Contact"
      description="Reach our admissions and front office team for tours, enrollment questions, or general inquiries."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-emerald-500/15 bg-gradient-to-b from-card to-emerald-50/25 shadow-sm transition-all duration-300 hover:shadow-md dark:to-emerald-950/15">
          <CardHeader>
            <div className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <MapPin className="h-5 w-5 shrink-0" />
              <CardTitle>Campus</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-1 text-sm leading-relaxed">
            <p className="font-medium text-foreground">Kathmandu Shikshyalaya</p>
            {CAMPUS_ADDRESS_LINES.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="pt-2">Hours: Sun–Fri · 9:00–4:00</p>
          </CardContent>
        </Card>
        <Card className="border-sky-500/15 bg-gradient-to-b from-card to-sky-50/25 shadow-sm transition-all duration-300 hover:shadow-md dark:to-sky-950/15">
          <CardHeader>
            <CardTitle>Phone & email</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-sm leading-relaxed">
            <p>Phone: +977-1-XXXXXXX</p>
            <p>Email: admissions@ktmshikshyalaya.edu.np</p>
          </CardContent>
        </Card>
      </div>
    </SitePageShell>
  );
}
