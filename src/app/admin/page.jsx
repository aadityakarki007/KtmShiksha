import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import ClassModel from "@/models/Class";
import Section from "@/models/Section";
import Subject from "@/models/Subject";
import Attendance from "@/models/Attendance";
import Exam from "@/models/Exam";
import Notice from "@/models/Notice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin overview",
};

export default async function AdminHomePage() {
  await connectDB();

  const [
    studentCount,
    teacherCount,
    classCount,
    sectionCount,
    subjectCount,
    attendanceCount,
    examCount,
    noticeCount,
  ] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    ClassModel.countDocuments(),
    Section.countDocuments(),
    Subject.countDocuments(),
    Attendance.countDocuments(),
    Exam.countDocuments(),
    Notice.countDocuments(),
  ]);

  const stats = [
    { label: "Students", value: studentCount },
    { label: "Teachers", value: teacherCount },
    { label: "Classes", value: classCount },
    { label: "Sections", value: sectionCount },
    { label: "Subjects", value: subjectCount },
    { label: "Attendance rows", value: attendanceCount },
    { label: "Exams", value: examCount },
    { label: "Notices", value: noticeCount },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard overview</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          Monitor enrollment, staffing, and daily operations. Use the sidebar to manage records,
          assessments, and communications.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
