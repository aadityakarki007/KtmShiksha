import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Exam from "@/models/Exam";
import Teacher from "@/models/Teacher";
import { requireApiAuth } from "@/lib/auth";
import { examBodySchema, paginationSchema } from "@/lib/validations";
import { jsonError, jsonOk, parseBody } from "@/lib/http";
import { buildPagination, escapeRegex } from "@/lib/pagination";
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

  const { page, limit, search } = parsedPage.data;
  const classId = params.classId;
  const subjectId = params.subjectId;

  const clauses = [];

  if (gate.role === "teacher") {
    const teacher = await Teacher.findOne({ clerkUserId: gate.userId }).lean();
    if (!teacher?.assignments?.length) {
      const meta = buildPagination({ page, limit }, 0);
      return jsonOk({ data: [], pagination: meta });
    }

    const pairs = teacher.assignments.map((a) => ({
      classId: String(a.classId),
      subjectId: String(a.subjectId),
    }));

    clauses.push({
      $or: pairs.map((p) => ({
        classId: new mongoose.Types.ObjectId(p.classId),
        subjectId: new mongoose.Types.ObjectId(p.subjectId),
      })),
    });
  }

  if (classId && mongoose.Types.ObjectId.isValid(classId)) {
    clauses.push({ classId });
  }
  if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
    clauses.push({ subjectId });
  }

  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    clauses.push({ name: rx });
  }

  const filter = clauses.length === 0 ? {} : clauses.length === 1 ? clauses[0] : { $and: clauses };

  const total = await Exam.countDocuments(filter);
  const meta = buildPagination({ page, limit }, total);

  const rows = await Exam.find(filter)
    .sort({ startDate: -1 })
    .skip(meta.skip)
    .limit(meta.limit)
    .populate("classId", "name level")
    .populate("subjectId", "name code")
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
  const parsed = examBodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
  }

  await connectDB();

  if (gate.role === "teacher") {
    const teacher = await Teacher.findOne({ clerkUserId: gate.userId }).lean();
    if (
      !teacher ||
      !teacherTeachesClassSubject(teacher, parsed.data.classId, parsed.data.subjectId)
    ) {
      return jsonError("Forbidden", 403);
    }
  }

  const doc = await Exam.create(parsed.data);
  const populated = await Exam.findById(doc._id)
    .populate("classId", "name level")
    .populate("subjectId", "name code")
    .lean();

  return jsonOk({ data: populated }, { status: 201 });
}
