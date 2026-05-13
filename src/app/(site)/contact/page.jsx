import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>
      <p className="text-muted-foreground mt-3 max-w-3xl text-lg leading-relaxed">
        Reach our admissions and front office team for tours, enrollment questions, or general inquiries.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campus</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-sm leading-relaxed">
            <p>Kathmandu Shikshyalaya</p>
            <p>Kathmandu Valley, Nepal</p>
            <p>Hours: Sun–Fri · 9:00–4:00</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Phone & email</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-sm leading-relaxed">
            <p>Phone: +977-1-XXXXXXX</p>
            <p>Email: admissions@ktmshikshyalaya.edu.np</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
