import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Student overview",
};

export default async function StudentHomePage() {
  const user = await currentUser();
  await connectDB();

  const student = await Student.findOne({ clerkUserId: user.id })
    .populate("classId", "name level")
    .populate("sectionId", "name")
    .lean();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Hello{student ? `, ${student.firstName}` : ""}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          Track attendance, assessments, and announcements tailored for you.
        </p>
      </div>

      {!student ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Link your enrollment</CardTitle>
            <CardDescription>
              We could not find a student profile connected to this login. Please contact the registrar if you
              believe this is an error.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Class</CardTitle>
              <CardDescription>Your homeroom placement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-semibold">{student.classId?.name}</p>
              <p className="text-muted-foreground">{student.classId?.level}</p>
              <p>
                Section <span className="font-medium">{student.sectionId?.name}</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick links</CardTitle>
              <CardDescription>Jump to detailed views</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild variant="secondary">
                <Link href="/student/attendance">Attendance history</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/student/marks">Marks & reports</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/student/notices">Notices</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
