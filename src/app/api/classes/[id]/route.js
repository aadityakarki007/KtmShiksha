import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import ClassModel from "@/models/Class";
import { requireApiAuth } from "@/lib/auth";
import { classBodySchema } from "@/lib/validations";
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

  const row = await ClassModel.findById(id).lean();
  if (!row) {
    return jsonError("Not found", 404);
  }

  return jsonOk({ data: row });
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
  const parsed = classBodySchema.partial().safeParse(raw);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
  }

  await connectDB();

  const updated = await ClassModel.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  }).lean();

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

  const deleted = await ClassModel.findByIdAndDelete(id).lean();
  if (!deleted) {
    return jsonError("Not found", 404);
  }

  return jsonOk({ ok: true });
}
