import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { StudentOverview } from "@/components/student/student-overview";

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

  const summary = student
    ? {
        firstName: student.firstName,
        className: student.classId?.name ?? "",
        classLevel: student.classId?.level ?? "",
        sectionName: student.sectionId?.name ?? "",
      }
    : null;

  return <StudentOverview summary={summary} />;
}
