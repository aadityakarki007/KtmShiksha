import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import "@/models/Class";
import "@/models/Section";
import "@/models/Subject";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "My classes",
};

export default async function TeacherClassesPage() {
  const user = await currentUser();
  if (!user?.id) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>Please sign in to view your assigned classes.</CardDescription>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Assigned classes</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Every pairing lists the class context and subject you support.
        </p>
      </div>

      {!teacher?.assignments?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>No assignments yet</CardTitle>
            <CardDescription>Ask an administrator to map your teaching load.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teacher.assignments.map((a, idx) => (
            <Card key={`${a.classId}-${a.sectionId}-${a.subjectId}-${idx}`}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {a.classId?.name} · {a.sectionId?.name} · {a.subjectId?.name}
                </CardTitle>
                <CardDescription>
                  {a.classId?.level} · Code {a.subjectId?.code || "—"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link href="/teacher/attendance">Attendance</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/teacher/marks">Marks</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
