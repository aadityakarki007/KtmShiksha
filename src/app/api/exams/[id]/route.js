import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Exam from "@/models/Exam";
import Teacher from "@/models/Teacher";
import { requireApiAuth } from "@/lib/auth";
import { examBodySchema } from "@/lib/validations";
import { jsonError, jsonOk, parseBody } from "@/lib/http";
import { teacherTeachesClassSubject } from "@/lib/teacher-access";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_req, ctx) {
  const gate = await requireApiAuth({
    allowedRoles: ["admin", "teacher", "student"],
  });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  const { id } = await ctx.params;
  if (!isValidId(id)) {
    return jsonError("Invalid id", 400);
  }

  await connectDB();

  const exam = await Exam.findById(id)
    .populate("classId", "name level")
    .populate("subjectId", "name code")
    .lean();

  if (!exam) {
    return jsonError("Not found", 404);
  }

  if (gate.role === "teacher") {
    const teacher = await Teacher.findOne({ clerkUserId: gate.userId }).lean();
    const classRef = exam.classId?._id ?? exam.classId;
    const subjectRef = exam.subjectId?._id ?? exam.subjectId;
    if (!teacher || !teacherTeachesClassSubject(teacher, classRef, subjectRef)) {
      return jsonError("Forbidden", 403);
    }
  }

  return jsonOk({ data: exam });
}

export async function PATCH(req, ctx) {
  const gate = await requireApiAuth({
    allowedRoles: ["admin", "teacher"],
  });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  const { id } = await ctx.params;
  if (!isValidId(id)) {
    return jsonError("Invalid id", 400);
  }

  const raw = await parseBody(req);
  const parsed = examBodySchema.partial().safeParse(raw);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
  }

  await connectDB();

  const existing = await Exam.findById(id).lean();
  if (!existing) {
    return jsonError("Not found", 404);
  }

  const nextClassId = parsed.data.classId ?? existing.classId;
  const nextSubjectId = parsed.data.subjectId ?? existing.subjectId;

  if (gate.role === "teacher") {
    const teacher = await Teacher.findOne({ clerkUserId: gate.userId }).lean();
    if (!teacher || !teacherTeachesClassSubject(teacher, nextClassId, nextSubjectId)) {
      return jsonError("Forbidden", 403);
    }
  }

  const updated = await Exam.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  })
    .populate("classId", "name level")
    .populate("subjectId", "name code")
    .lean();

  return jsonOk({ data: updated });
}

export async function DELETE(_req, ctx) {
  const gate = await requireApiAuth({ allowedRoles: ["admin"] });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  const { id } = await ctx.params;
  if (!isValidId(id)) {
    return jsonError("Invalid id", 400);
  }

  await connectDB();

  const deleted = await Exam.findByIdAndDelete(id).lean();
  if (!deleted) {
    return jsonError("Not found", 404);
  }

  return jsonOk({ ok: true });
}
