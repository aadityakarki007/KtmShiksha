import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Notice from "@/models/Notice";
import { requireApiAuth } from "@/lib/auth";
import { noticeBodySchema } from "@/lib/validations";
import { jsonError, jsonOk, parseBody } from "@/lib/http";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_req, ctx) {
  await connectDB();

  const { id } = await ctx.params;
  if (!isValidId(id)) {
    return jsonError("Invalid id", 400);
  }

  const row = await Notice.findById(id).lean();
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
  const parsed = noticeBodySchema.partial().safeParse(raw);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
  }

  await connectDB();

  const updated = await Notice.findByIdAndUpdate(id, parsed.data, {
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

  const deleted = await Notice.findByIdAndDelete(id).lean();
  if (!deleted) {
    return jsonError("Not found", 404);
  }

  return jsonOk({ ok: true });
}
