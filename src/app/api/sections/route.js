import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Section from "@/models/Section";
import { requireApiAuth } from "@/lib/auth";
import { paginationSchema, sectionBodySchema } from "@/lib/validations";
import { jsonError, jsonOk, parseBody } from "@/lib/http";
import { buildPagination, escapeRegex } from "@/lib/pagination";

export async function GET(req) {
  const gate = await requireApiAuth({
    allowedRoles: ["admin", "teacher", "student"],
  });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  await connectDB();

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const numericLimit = Number(params.limit);
  if (params.limit !== undefined && Number.isFinite(numericLimit) && numericLimit > 100) {
    params.limit = "100";
  }

  const parsedPage = paginationSchema.safeParse(params);
  if (!parsedPage.success) {
    return jsonError(parsedPage.error.flatten().formErrors.join(", "), 400);
  }

  const { page, limit, search } = parsedPage.data;
  const classId = params.classId;

  const filter = {};
  if (classId && mongoose.Types.ObjectId.isValid(classId)) {
    filter.classId = classId;
  }

  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.name = rx;
  }

  const total = await Section.countDocuments(filter);
  const meta = buildPagination({ page, limit }, total);

  const rows = await Section.find(filter)
    .sort({ name: 1 })
    .skip(meta.skip)
    .limit(meta.limit)
    .populate("classId", "name level")
    .lean();

  return jsonOk({ data: rows, pagination: meta });
}

export async function POST(req) {
  const gate = await requireApiAuth({ allowedRoles: ["admin"] });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  const raw = await parseBody(req);
  const parsed = sectionBodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
  }

  await connectDB();

  const doc = await Section.create(parsed.data);
  const populated = await Section.findById(doc._id).populate("classId", "name level").lean();

  return jsonOk({ data: populated }, { status: 201 });
}
