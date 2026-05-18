//src/app/api/students/[id]/route.js
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { requireApiAuth } from "@/lib/auth";
import { studentBodySchema } from "@/lib/validations";
import { jsonError, jsonOk, parseBody } from "@/lib/http";

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

  const student = await Student.findById(id)
    .populate("classId", "name level")
    .populate("sectionId", "name")
    .lean();

  if (!student) {
    return jsonError("Not found", 404);
  }

  if (gate.role === "student") {
    const own = await Student.findOne({ clerkUserId: gate.userId }).lean();
    if (!own || String(own._id) !== String(student._id)) {
      return jsonError("Forbidden", 403);
    }
  }

  return jsonOk({ data: student });
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
  const parsed = studentBodySchema.partial().safeParse(raw);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
  }

  await connectDB();

  const updated = await Student.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  })
    .populate("classId", "name level")
    .populate("sectionId", "name")
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

  const deleted = await Student.findByIdAndDelete(id).lean();
  if (!deleted) {
    return jsonError("Not found", 404);
  }

  return jsonOk({ ok: true });
}
