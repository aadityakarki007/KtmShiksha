import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import "@/models/Class";
import "@/models/Section";
import Teacher from "@/models/Teacher";
import { requireApiAuth } from "@/lib/auth";
import { attendanceBodySchema } from "@/lib/validations";
import { jsonError, jsonOk, parseBody } from "@/lib/http";
import { teacherTeachesClassSection } from "@/lib/teacher-access";

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
  const parsed = attendanceBodySchema.partial().safeParse(raw);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
  }

  await connectDB();

  const existing = await Attendance.findById(id).lean();
  if (!existing) {
    return jsonError("Not found", 404);
  }

  const targetClassId = parsed.data.classId ?? existing.classId;
  const targetSectionId = parsed.data.sectionId ?? existing.sectionId;

  if (gate.role === "teacher") {
    const teacher = await Teacher.findOne({ clerkUserId: gate.userId }).lean();
    if (!teacher || !teacherTeachesClassSection(teacher, targetClassId, targetSectionId)) {
      return jsonError("Forbidden", 403);
    }
    parsed.data.markedBy = teacher._id;
  }

  const updated = await Attendance.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  })
    .populate("studentId", "firstName lastName rollNumber")
    .populate("classId", "name level")
    .populate("sectionId", "name")
    .populate("markedBy", "firstName lastName email")
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

  const deleted = await Attendance.findByIdAndDelete(id).lean();
  if (!deleted) {
    return jsonError("Not found", 404);
  }

  return jsonOk({ ok: true });
}
