//src/app/api/students/route.js
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import "@/models/Class";
import "@/models/Section";
import { requireApiAuth } from "@/lib/auth";
import { paginationSchema, studentBodySchema } from "@/lib/validations";
import { jsonError, jsonOk, parseBody } from "@/lib/http";
import { buildPagination, escapeRegex } from "@/lib/pagination";

export async function GET(req) {
  const gate = await requireApiAuth({
    allowedRoles: ["admin", "teacher"],
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

  const parsedPage = paginationSchema.safeParse({
    page: params.page,
    limit: params.limit,
    search: params.search,
  });
  if (!parsedPage.success) {
    return jsonError(parsedPage.error.flatten().formErrors.join(", "), 400);
  }

  const { page, limit, search } = parsedPage.data;
  const classId = params.classId;
  const sectionId = params.sectionId;

  const filter = {};

  let teacherDoc = null;
  let allowedClassIds = null;

  if (gate.role === "teacher") {
    teacherDoc = await Teacher.findOne({ clerkUserId: gate.userId }).lean();
    if (!teacherDoc || !teacherDoc.assignments?.length) {
      const total = 0;
      const meta = buildPagination({ page, limit }, total);
      return jsonOk({ data: [], pagination: meta });
    }
    allowedClassIds = new Set(
      teacherDoc.assignments.map((a) => String(a.classId?._id ?? a.classId))
    );
  }

  if (classId && mongoose.Types.ObjectId.isValid(classId)) {
    if (allowedClassIds && !allowedClassIds.has(classId)) {
      const meta = buildPagination({ page, limit }, 0);
      return jsonOk({ data: [], pagination: meta });
    }
    filter.classId = classId;
  } else if (allowedClassIds) {
    const ids = [...allowedClassIds].map((cid) => new mongoose.Types.ObjectId(cid));
    filter.classId = { $in: ids };
  }

  if (sectionId && mongoose.Types.ObjectId.isValid(sectionId)) {
    filter.sectionId = sectionId;
  }

  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { firstName: rx },
      { lastName: rx },
      { email: rx },
      { rollNumber: rx },
    ];
  }

  const total = await Student.countDocuments(filter);
  const meta = buildPagination({ page, limit }, total);

  const rows = await Student.find(filter)
    .sort({ rollNumber: 1 })
    .skip(meta.skip)
    .limit(meta.limit)
    .populate("classId", "name level")
    .populate("sectionId", "name")
    .lean();

  return jsonOk({ data: rows, pagination: meta });
}

export async function POST(req) {
  const gate = await requireApiAuth({ allowedRoles: ["admin"] });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  const raw = await parseBody(req);
  const parsed = studentBodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
  }

  await connectDB();

  const payload = parsed.data;
  const doc = await Student.create(payload);
  const populated = await Student.findById(doc._id)
    .populate("classId", "name level")
    .populate("sectionId", "name")
    .lean();

  return jsonOk({ data: populated }, { status: 201 });
}
