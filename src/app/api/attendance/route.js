import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import "@/models/Class";
import "@/models/Section";
import { requireApiAuth } from "@/lib/auth";
import { attendanceBodySchema, attendanceBulkSchema, paginationSchema } from "@/lib/validations";
import { jsonError, jsonOk, parseBody } from "@/lib/http";
import { buildPagination } from "@/lib/pagination";
import { teacherTeachesClassSection } from "@/lib/teacher-access";

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

  const { page, limit } = parsedPage.data;
  const filter = {};

  const studentId = params.studentId;
  const classId = params.classId;
  const sectionId = params.sectionId;
  const start = params.startDate ? new Date(params.startDate) : null;
  const end = params.endDate ? new Date(params.endDate) : null;

  if (gate.role === "student") {
    const student = await Student.findOne({ clerkUserId: gate.userId }).lean();
    if (!student) {
      const meta = buildPagination({ page, limit }, 0);
      return jsonOk({ data: [], pagination: meta });
    }
    filter.studentId = student._id;
  } else if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
    filter.studentId = studentId;
  }

  if (gate.role === "teacher") {
    const teacher = await Teacher.findOne({ clerkUserId: gate.userId }).lean();
    if (!teacher) {
      const meta = buildPagination({ page, limit }, 0);
      return jsonOk({ data: [], pagination: meta });
    }

    const assignmentClassIds = [
      ...new Set(
        (teacher.assignments ?? []).map((a) => String(a.classId?._id ?? a.classId ?? ""))
      ),
    ].filter(Boolean);

    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      if (!assignmentClassIds.includes(String(classId))) {
        const meta = buildPagination({ page, limit }, 0);
        return jsonOk({ data: [], pagination: meta });
      }
      filter.classId = classId;

      if (sectionId && mongoose.Types.ObjectId.isValid(sectionId)) {
        if (!teacherTeachesClassSection(teacher, classId, sectionId)) {
          const meta = buildPagination({ page, limit }, 0);
          return jsonOk({ data: [], pagination: meta });
        }
        filter.sectionId = sectionId;
      } else {
        const allowedSections = [
          ...new Set(
            (teacher.assignments ?? [])
              .filter((a) => String(a.classId?._id ?? a.classId) === String(classId))
              .map((a) => String(a.sectionId?._id ?? a.sectionId))
              .filter(Boolean)
          ),
        ];
        if (allowedSections.length) {
          filter.sectionId = {
            $in: allowedSections.map((id) => new mongoose.Types.ObjectId(id)),
          };
        }
      }
    } else {
      const pairs = (teacher.assignments ?? [])
        .map((a) => ({
          classId: a.classId?._id ?? a.classId,
          sectionId: a.sectionId?._id ?? a.sectionId,
        }))
        .filter((p) => p.classId && p.sectionId && mongoose.Types.ObjectId.isValid(String(p.classId)) && mongoose.Types.ObjectId.isValid(String(p.sectionId)));
      if (!pairs.length) {
        const meta = buildPagination({ page, limit }, 0);
        return jsonOk({ data: [], pagination: meta });
      }
      filter.$or = pairs.map((p) => ({
        classId: new mongoose.Types.ObjectId(String(p.classId)),
        sectionId: new mongoose.Types.ObjectId(String(p.sectionId)),
      }));
    }
  } else if (classId && mongoose.Types.ObjectId.isValid(classId)) {
    filter.classId = classId;
  }

  const teacherScopedSection =
    gate.role === "teacher" &&
    (filter.sectionId !== undefined || filter.$or !== undefined);

  if (sectionId && mongoose.Types.ObjectId.isValid(sectionId) && !teacherScopedSection) {
    filter.sectionId = sectionId;
  }

  if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
    filter.date = { $gte: start, $lte: end };
  } else if (start && !Number.isNaN(start.getTime())) {
    filter.date = { $gte: start };
  } else if (end && !Number.isNaN(end.getTime())) {
    filter.date = { $lte: end };
  }

  const total = await Attendance.countDocuments(filter);
  const meta = buildPagination({ page, limit }, total);

  const rows = await Attendance.find(filter)
    .sort({ date: -1 })
    .skip(meta.skip)
    .limit(meta.limit)
    .populate("studentId", "firstName lastName rollNumber")
    .populate("classId", "name level")
    .populate("sectionId", "name")
    .populate("markedBy", "firstName lastName email")
    .lean();

  return jsonOk({ data: rows, pagination: meta });
}

export async function POST(req) {
  const gate = await requireApiAuth({
    allowedRoles: ["admin", "teacher"],
  });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  const raw = await parseBody(req);
  if (!raw) {
    return jsonError("Invalid JSON body", 400);
  }

  await connectDB();

  if (Array.isArray(raw.entries)) {
    const parsed = attendanceBulkSchema.safeParse(raw);
    if (!parsed.success) {
      return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
    }

    const { date, classId, sectionId, entries } = parsed.data;

    let markedByTeacherId = null;
    if (gate.role === "teacher") {
      const teacher = await Teacher.findOne({ clerkUserId: gate.userId }).lean();
      if (!teacher || !teacherTeachesClassSection(teacher, classId, sectionId)) {
        return jsonError("Forbidden", 403);
      }
      markedByTeacherId = teacher._id;
    } else {
      const markedByParam = raw.markedBy;
      if (!markedByParam || !mongoose.Types.ObjectId.isValid(markedByParam)) {
        return jsonError("markedBy teacher id is required for admin bulk save", 400);
      }
      markedByTeacherId = markedByParam;
    }

    const ops = entries.map((entry) =>
      Attendance.findOneAndUpdate(
        {
          date: new Date(date),
          studentId: entry.studentId,
        },
        {
          date: new Date(date),
          studentId: entry.studentId,
          classId,
          sectionId,
          status: entry.status,
          markedBy: markedByTeacherId,
          note: entry.note ?? "",
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      )
    );

    const results = await Promise.all(ops);
    return jsonOk(
      {
        data: results.map((doc) => (doc?.toObject ? doc.toObject() : doc)),
        count: results.length,
      },
      { status: 201 }
    );
  }

  const parsedSingle = attendanceBodySchema.safeParse(raw);
  if (!parsedSingle.success) {
    return jsonError(parsedSingle.error.flatten().formErrors.join(", "), 422);
  }

  const payload = { ...parsedSingle.data };

  if (gate.role === "teacher") {
    const teacher = await Teacher.findOne({ clerkUserId: gate.userId }).lean();
    if (!teacher || !teacherTeachesClassSection(teacher, payload.classId, payload.sectionId)) {
      return jsonError("Forbidden", 403);
    }
    payload.markedBy = teacher._id;
  } else if (!payload.markedBy) {
    return jsonError("markedBy is required", 400);
  }

  const doc = await Attendance.findOneAndUpdate(
    {
      date: payload.date,
      studentId: payload.studentId,
    },
    payload,
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  )
    .populate("studentId", "firstName lastName rollNumber")
    .populate("classId", "name level")
    .populate("sectionId", "name")
    .populate("markedBy", "firstName lastName email")
    .lean();

  return jsonOk({ data: doc }, { status: 201 });
}
