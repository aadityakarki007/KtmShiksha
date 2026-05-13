import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Mark from "@/models/Mark";
import Exam from "@/models/Exam";
import Teacher from "@/models/Teacher";
import { requireApiAuth } from "@/lib/auth";
import { markBodySchema } from "@/lib/validations";
import { jsonError, jsonOk, parseBody } from "@/lib/http";
import { teacherTeachesClassSubject } from "@/lib/teacher-access";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
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
  const parsed = markBodySchema.partial().safeParse(raw);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
  }

  await connectDB();

  const existing = await Mark.findById(id).lean();
  if (!existing) {
    return jsonError("Not found", 404);
  }

  const examId = parsed.data.examId ?? existing.examId;
  const exam = await Exam.findById(examId).lean();
  if (!exam) {
    return jsonError("Exam not found", 400);
  }

  if (gate.role === "teacher") {
    const teacher = await Teacher.findOne({ clerkUserId: gate.userId }).lean();
    if (!teacher || !teacherTeachesClassSubject(teacher, exam.classId, exam.subjectId)) {
      return jsonError("Forbidden", 403);
    }
  }

  const updated = await Mark.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  })
    .populate("examId", "name maxScore examType")
    .populate("subjectId", "name code")
    .populate("studentId", "firstName lastName rollNumber")
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

  const deleted = await Mark.findByIdAndDelete(id).lean();
  if (!deleted) {
    return jsonError("Not found", 404);
  }

  return jsonOk({ ok: true });
}
