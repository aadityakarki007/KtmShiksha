import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import Attendance from "@/models/Attendance";
import Mark from "@/models/Mark";
import { requireApiAuth } from "@/lib/auth";
import { exportQuerySchema } from "@/lib/validations";
import { jsonError } from "@/lib/http";
import { buildWorkbookBuffer, rowsToCsv } from "@/lib/excel";

function buildFilename(type, format) {
  const stamp = new Date().toISOString().slice(0, 10);
  return `${type}-export-${stamp}.${format === "csv" ? "csv" : "xlsx"}`;
}

export async function GET(req) {
  const gate = await requireApiAuth({ allowedRoles: ["admin"] });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = exportQuerySchema.safeParse(params);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
  }

  const { type, format, template, classId, sectionId, startDate, endDate } = parsed.data;

  await connectDB();

  if (template === "true") {
    const sampleStudents = [
      {
        "Roll No": "101",
        "Student's Name": "Sample Student",
        "Date Of Birth": "2010-01-15",
        Address: "Sample Address",
        "Parent's Name": "Parent Name",
        "Contact No": "9800000000",
        House: "House A",
        "EMIS ID": "EMIS-12345",
      },
    ];

    const sampleTeachers = [
      {
        firstName: "Sample",
        lastName: "Teacher",
        email: "teacher@example.com",
        phone: "9800000001",
        employeeId: "T-001",
        classes: "",
        subjects: "",
      },
    ];

    const rows = type === "students" ? sampleStudents : sampleTeachers;
    const filename = buildFilename(`${type}-template`, format);

    if (format === "csv") {
      const csv = rowsToCsv(rows);
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const buffer = buildWorkbookBuffer(rows, "Template");
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  let rows = [];

  if (type === "students") {
    const filter = {};
    if (classId) filter.classId = classId;
    if (sectionId) filter.sectionId = sectionId;

    const docs = await Student.find(filter)
      .populate("classId", "name level")
      .populate("sectionId", "name")
      .lean();

    rows = docs.map((doc) => ({
      "Roll No": doc.rollNumber,
      "Student's Name": `${doc.firstName} ${doc.lastName}`.trim(),
      "Date Of Birth": doc.dateOfBirth ? new Date(doc.dateOfBirth).toISOString().split('T')[0] : "",
      Address: doc.address,
      "Parent's Name": doc.parentName,
      "Contact No": doc.parentPhone,
      House: doc.house,
      "EMIS ID": doc.emisId,
    }));
  }

  if (type === "teachers") {
    const docs = await Teacher.find({})
      .populate("assignments.classId", "name level")
      .populate("assignments.subjectId", "name code")
      .lean();

    rows = docs.map((doc) => ({
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      phone: doc.phone,
      employeeId: doc.employeeId,
      classes: doc.assignments?.map((a) => String(a.classId?._id ?? a.classId)).join(","),
      subjects: doc.assignments?.map((a) => String(a.subjectId?._id ?? a.subjectId)).join(","),
    }));
  }

  if (type === "attendance") {
    const filter = {};
    if (classId) filter.classId = classId;
    if (sectionId) filter.sectionId = sectionId;
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const docs = await Attendance.find(filter)
      .populate("studentId", "firstName lastName rollNumber")
      .populate("classId", "name level")
      .populate("sectionId", "name")
      .lean();

    rows = docs.map((doc) => ({
      date: doc.date?.toISOString?.() ?? doc.date,
      student: `${doc.studentId?.firstName ?? ""} ${doc.studentId?.lastName ?? ""}`.trim(),
      rollNumber: doc.studentId?.rollNumber,
      className: doc.classId?.name,
      section: doc.sectionId?.name,
      status: doc.status,
      note: doc.note,
    }));
  }

  if (type === "marks") {
    const filter = {};
    if (startDate && endDate) {
      filter.updatedAt = { $gte: startDate, $lte: endDate };
    }

    const docs = await Mark.find(filter)
      .populate("examId", "name")
      .populate("subjectId", "name code")
      .populate("studentId", "firstName lastName rollNumber")
      .limit(5000)
      .lean();

    rows = docs.map((doc) => ({
      exam: doc.examId?.name,
      subject: doc.subjectId?.name,
      student: `${doc.studentId?.firstName ?? ""} ${doc.studentId?.lastName ?? ""}`.trim(),
      rollNumber: doc.studentId?.rollNumber,
      score: doc.score,
      maxScore: doc.maxScore,
      remarks: doc.remarks,
    }));
  }

  const filename = buildFilename(type, format);

  if (format === "csv") {
    const csv = rowsToCsv(rows);
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const buffer = buildWorkbookBuffer(rows, type);
  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
