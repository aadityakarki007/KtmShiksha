import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import "@/models/Class";
import "@/models/Section";
import "@/models/Subject";
import { requireApiAuth } from "@/lib/auth";
import { teacherBodySchema } from "@/lib/validations";
import { jsonError, jsonOk, parseBody } from "@/lib/http";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_req, ctx) {
  const gate = await requireApiAuth({ allowedRoles: ["admin", "teacher"] });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  const { id } = await ctx.params;
  if (!isValidId(id)) {
    return jsonError("Invalid id", 400);
  }

  await connectDB();

  const teacher = await Teacher.findById(id)
    .populate("assignments.classId", "name level")
    .populate("assignments.sectionId", "name classId")
    .populate("assignments.subjectId", "name code")
    .lean();

  if (!teacher) {
    return jsonError("Not found", 404);
  }

  if (gate.role === "teacher") {
    const self = await Teacher.findOne({ clerkUserId: gate.userId }).lean();
    if (!self || String(self._id) !== String(teacher._id)) {
      return jsonError("Forbidden", 403);
    }
  }

  return jsonOk({ data: teacher });
}

export async function PATCH(req, ctx) {
  const gate = await requireApiAuth({ allowedRoles: ["admin"] });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  const { id } = await ctx.params;
  if (!isValidId(id)) {
    return jsonError("Invalid id", 400);
  }

  const raw = await parseBody(req);
  const parsed = teacherBodySchema.partial().safeParse(raw);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
  }

  await connectDB();

  const updated = await Teacher.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  })
    .populate("assignments.classId", "name level")
    .populate("assignments.sectionId", "name classId")
    .populate("assignments.subjectId", "name code")
    .lean();

  if (!updated) {
    return jsonError("Not found", 404);
  }

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

  const deleted = await Teacher.findByIdAndDelete(id).lean();
  if (!deleted) {
    return jsonError("Not found", 404);
  }

  return jsonOk({ ok: true });
}
