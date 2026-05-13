import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import "@/models/Class";
import "@/models/Section";
import "@/models/Subject";
import { requireApiAuth } from "@/lib/auth";
import { paginationSchema, teacherBodySchema } from "@/lib/validations";
import { jsonError, jsonOk, parseBody } from "@/lib/http";
import { buildPagination, escapeRegex } from "@/lib/pagination";

export async function GET(req) {
  const gate = await requireApiAuth({ allowedRoles: ["admin", "teacher"] });
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

  const filter = {};

  if (gate.role === "teacher") {
    const self = await Teacher.findOne({ clerkUserId: gate.userId }).lean();
    if (!self) {
      const meta = buildPagination({ page, limit }, 0);
      return jsonOk({ data: [], pagination: meta });
    }
    filter._id = self._id;
  }

  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }, { employeeId: rx }];
  }

  const total = await Teacher.countDocuments(filter);
  const meta = buildPagination({ page, limit }, total);

  const rows = await Teacher.find(filter)
    .sort({ createdAt: -1 })
    .skip(meta.skip)
    .limit(meta.limit)
    .populate("assignments.classId", "name level")
    .populate("assignments.sectionId", "name classId")
    .populate("assignments.subjectId", "name code")
    .lean();

  return jsonOk({ data: rows, pagination: meta });
}

export async function POST(req) {
  const gate = await requireApiAuth({ allowedRoles: ["admin"] });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  const raw = await parseBody(req);
  const parsed = teacherBodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
  }

  await connectDB();

  const payload = { ...parsed.data, assignments: parsed.data.assignments ?? [] };
  const doc = await Teacher.create(payload);
  const populated = await Teacher.findById(doc._id)
    .populate("assignments.classId", "name level")
    .populate("assignments.sectionId", "name classId")
    .populate("assignments.subjectId", "name code")
    .lean();

  return jsonOk({ data: populated }, { status: 201 });
}
