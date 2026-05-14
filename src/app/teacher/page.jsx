import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import DashboardAttendanceList from "@/components/attendance/dashboard-attendance-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Teacher overview",
};

export default async function TeacherHomePage() {
  const user = await currentUser();
  if (!user?.id) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>Please sign in to view your teacher dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm">
              <Link href="/sign-in">Go to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  await connectDB();

  const teacher = await Teacher.findOne({ clerkUserId: user.id })
    .populate("assignments.classId", "name level")
    .populate("assignments.sectionId", "name")
    .populate("assignments.subjectId", "name code")
    .lean();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome{teacher ? `, ${teacher.firstName}` : ""}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          Review your teaching assignments, record attendance, and publish marks for the classes you serve.
        </p>
      </div>

      {!teacher ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Complete your faculty profile</CardTitle>
            <CardDescription>
              Your Clerk account is not yet linked to a teacher record. Ask an administrator to connect your
              profile or update your email match in the staff directory.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>Classes and subjects you are mapped to teach.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {teacher.assignments?.length ? (
              <ul className="space-y-2 text-sm">
                {teacher.assignments.map((a, idx) => (
                  <li
                    key={`${a.classId}-${a.sectionId}-${a.subjectId}-${idx}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2"
                  >
                    <span className="font-medium">
                      {a.classId?.name ?? "Class"} · {a.sectionId?.name ?? "Section"} ·{" "}
                      {a.subjectId?.name ?? "Subject"}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {a.classId?.level} · Code {a.subjectId?.code || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No assignments yet.</p>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild size="sm">
                <Link href="/teacher/attendance">Take attendance (BS dates)</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/teacher/marks">Enter marks</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {teacher ? <DashboardAttendanceList role="teacher" /> : null}
    </div>
  );
}
