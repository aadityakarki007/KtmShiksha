import { connectDB } from "@/lib/mongodb";
import ClassModel from "@/models/Class";
import { requireApiAuth } from "@/lib/auth";
import { classBodySchema, paginationSchema } from "@/lib/validations";
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
  const filter = {};

  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: rx }, { level: rx }, { academicYear: rx }];
  }

  const total = await ClassModel.countDocuments(filter);
  const meta = buildPagination({ page, limit }, total);

  const rows = await ClassModel.find(filter)
    .sort({ level: 1, name: 1 })
    .skip(meta.skip)
    .limit(meta.limit)
    .lean();

  return jsonOk({ data: rows, pagination: meta });
}

export async function POST(req) {
  const gate = await requireApiAuth({ allowedRoles: ["admin"] });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  const raw = await parseBody(req);
  const parsed = classBodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
  }

  await connectDB();

  const doc = await ClassModel.create(parsed.data);
  return jsonOk({ data: doc.toObject() }, { status: 201 });
}
