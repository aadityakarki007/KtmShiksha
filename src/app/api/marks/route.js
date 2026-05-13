import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Mark from "@/models/Mark";
import Exam from "@/models/Exam";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import { requireApiAuth } from "@/lib/auth";
import { markBodySchema, paginationSchema } from "@/lib/validations";
import { jsonError, jsonOk, parseBody } from "@/lib/http";
import { buildPagination } from "@/lib/pagination";
import { teacherTeachesClassSubject } from "@/lib/teacher-access";

export async function GET(req) {
  const gate = await requireApiAuth({
    allowedRoles: ["admin", "teacher", "student"],
  });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  await connectDB();

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsedPage = paginationSchema.safeParse(params);
  if (!parsedPage.success) {
    return jsonError(parsedPage.error.flatten().formErrors.join(", "), 400);
  }

  const { page, limit } = parsedPage.data;
  const filter = {};

  const examId = params.examId;
  const studentId = params.studentId;
  const subjectId = params.subjectId;

  if (examId && mongoose.Types.ObjectId.isValid(examId)) {
    filter.examId = examId;
  }
  if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
    filter.studentId = studentId;
  }
  if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
    filter.subjectId = subjectId;
  }

  if (gate.role === "student") {
    const student = await Student.findOne({ clerkUserId: gate.userId }).lean();
    if (!student) {
      const meta = buildPagination({ page, limit }, 0);
      return jsonOk({ data: [], pagination: meta });
    }
    filter.studentId = student._id;
  }

  if (gate.role === "teacher") {
    const teacher = await Teacher.findOne({ clerkUserId: gate.userId }).lean();
    if (!teacher?.assignments?.length) {
      const meta = buildPagination({ page, limit }, 0);
      return jsonOk({ data: [], pagination: meta });
    }

    if (examId) {
      const exam = await Exam.findById(examId).lean();
      if (
        !exam ||
        !teacherTeachesClassSubject(teacher, exam.classId, exam.subjectId)
      ) {
        const meta = buildPagination({ page, limit }, 0);
        return jsonOk({ data: [], pagination: meta });
      }
    } else {
      const pairs = teacher.assignments.map((a) => ({
        classId: String(a.classId),
        subjectId: String(a.subjectId),
      }));

      const exams = await Exam.find({
        $or: pairs.map((p) => ({
          classId: new mongoose.Types.ObjectId(p.classId),
          subjectId: new mongoose.Types.ObjectId(p.subjectId),
        })),
      })
        .select("_id")
        .lean();

      filter.examId = { $in: exams.map((e) => e._id) };
    }
  }

  const total = await Mark.countDocuments(filter);
  const meta = buildPagination({ page, limit }, total);

  const rows = await Mark.find(filter)
    .sort({ updatedAt: -1 })
    .skip(meta.skip)
    .limit(meta.limit)
    .populate("examId", "name maxScore examType")
    .populate("subjectId", "name code")
    .populate("studentId", "firstName lastName rollNumber")
    .lean();

  return jsonOk({ data: rows, pagination: meta });
}

export async function POST(req) {
  const gate = await requireApiAuth({
    allowedRoles: ["admin", "teacher"],
  });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  const raw = await parseBody(req);
  const parsed = markBodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
  }

  await connectDB();

  const exam = await Exam.findById(parsed.data.examId).lean();
  if (!exam) {
    return jsonError("Exam not found", 400);
  }

  if (String(exam.subjectId) !== String(parsed.data.subjectId)) {
    return jsonError("Subject does not match exam", 400);
  }

  if (gate.role === "teacher") {
    const teacher = await Teacher.findOne({ clerkUserId: gate.userId }).lean();
    if (
      !teacher ||
      !teacherTeachesClassSubject(teacher, exam.classId, exam.subjectId)
    ) {
      return jsonError("Forbidden", 403);
    }
  }

  const payload = {
    ...parsed.data,
    maxScore: parsed.data.maxScore ?? exam.maxScore ?? 100,
  };

  const doc = await Mark.findOneAndUpdate(
    {
      examId: payload.examId,
      studentId: payload.studentId,
      subjectId: payload.subjectId,
    },
    payload,
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  )
    .populate("examId", "name maxScore examType")
    .populate("subjectId", "name code")
    .populate("studentId", "firstName lastName rollNumber")
    .lean();

  return jsonOk({ data: doc }, { status: 201 });
}
