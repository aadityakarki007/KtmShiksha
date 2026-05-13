import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import ClassModel from "@/models/Class";
import Section from "@/models/Section";
import Subject from "@/models/Subject";
import Attendance from "@/models/Attendance";
import Exam from "@/models/Exam";
import Mark from "@/models/Mark";
import Notice from "@/models/Notice";
import { requireApiAuth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";

export async function GET() {
  const gate = await requireApiAuth({ allowedRoles: ["admin"] });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  await connectDB();

  const [
    students,
    teachers,
    classes,
    sections,
    subjects,
    attendanceRecords,
    exams,
    marks,
    notices,
  ] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    ClassModel.countDocuments(),
    Section.countDocuments(),
    Subject.countDocuments(),
    Attendance.countDocuments(),
    Exam.countDocuments(),
    Mark.countDocuments(),
    Notice.countDocuments(),
  ]);

  return jsonOk({
    data: {
      students,
      teachers,
      classes,
      sections,
      subjects,
      attendanceRecords,
      exams,
      marks,
      notices,
    },
  });
}
