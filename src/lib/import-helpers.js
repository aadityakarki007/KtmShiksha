import mongoose from "mongoose";
import ClassModel from "@/models/Class";
import Section from "@/models/Section";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import { GRADE_LEVELS } from "@/lib/constants";

function normalizeHeader(key) {
  return String(key ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

export function normalizeRow(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[normalizeHeader(k)] = typeof v === "string" ? v.trim() : v;
  }
  return out;
}

async function resolveClassSection(level, className, sectionName) {
  let cls = null;

  if (GRADE_LEVELS.includes(level)) {
    cls = await ClassModel.findOne({ level }).lean();
  }
  if (!cls && className) {
    cls = await ClassModel.findOne({ name: className }).lean();
  }
  if (!cls && level) {
    cls = await ClassModel.findOne({ name: level }).lean();
  }
  if (!cls) {
    return { error: "Class not found for provided level/class name" };
  }

  const sec = await Section.findOne({
    classId: cls._id,
    name: new RegExp(`^${escapeRegex(String(sectionName))}$`, "i"),
  }).lean();

  if (!sec) {
    return { error: "Section not found for class" };
  }

  return { classId: cls._id, sectionId: sec._id };
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function validateStudentRows(rows, duplicateStrategy) {
  const summary = { created: 0, updated: 0, skipped: 0, errors: [], duplicates: [] };
  const prepared = [];

  for (let i = 0; i < rows.length; i += 1) {
    const raw = normalizeRow(rows[i]);
    const rowIndex = i + 2;

    const firstName = raw.firstname || raw.first_name;
    const lastName = raw.lastname || raw.last_name;
    const email = raw.email || "";
    const rollNumber = raw.rollnumber || raw.roll_number || "";
    const level = raw.level || raw.grade || "";
    const className = raw.classname || raw.class_name || raw.class || "";
    const sectionName = raw.section || raw.sectionname || raw.section_name || "";

    if (!firstName || !lastName) {
      summary.errors.push({ row: rowIndex, message: "firstName and lastName are required" });
      continue;
    }
    if (!level || !sectionName) {
      summary.errors.push({ row: rowIndex, message: "level and section are required" });
      continue;
    }

    const resolved = await resolveClassSection(level, className || level, sectionName);
    if (resolved.error) {
      summary.errors.push({ row: rowIndex, message: resolved.error });
      continue;
    }

    let duplicate = null;
    if (email) {
      duplicate = await Student.findOne({ email }).lean();
    }
    if (!duplicate && rollNumber) {
      duplicate = await Student.findOne({
        rollNumber,
        classId: resolved.classId,
      }).lean();
    }

    if (duplicate) {
      summary.duplicates.push({
        row: rowIndex,
        reason: email ? "email" : "rollNumber",
        existingId: String(duplicate._id),
      });
      if (duplicateStrategy === "skip") {
        summary.skipped += 1;
        continue;
      }
    }

    prepared.push({
      rowIndex,
      payload: {
        firstName,
        lastName,
        email,
        rollNumber,
        classId: resolved.classId,
        sectionId: resolved.sectionId,
        parentPhone: raw.parentphone || raw.parent_phone || "",
        parentName: raw.parentname || raw.parent_name || "",
      },
      duplicateId: duplicate ? duplicate._id : null,
    });
  }

  return { summary, prepared };
}

export async function validateTeacherRows(rows, duplicateStrategy) {
  const summary = { created: 0, updated: 0, skipped: 0, errors: [], duplicates: [] };
  const prepared = [];

  for (let i = 0; i < rows.length; i += 1) {
    const raw = normalizeRow(rows[i]);
    const rowIndex = i + 2;

    const firstName = raw.firstname || raw.first_name;
    const lastName = raw.lastname || raw.last_name;
    const email = raw.email;

    if (!firstName || !lastName || !email) {
      summary.errors.push({ row: rowIndex, message: "firstName, lastName, and email are required" });
      continue;
    }

    const duplicate = await Teacher.findOne({ email: email.toLowerCase() }).lean();
    if (duplicate) {
      summary.duplicates.push({
        row: rowIndex,
        reason: "email",
        existingId: String(duplicate._id),
      });
      if (duplicateStrategy === "skip") {
        summary.skipped += 1;
        continue;
      }
    }

    const assignments = [];
    const classCodes = String(raw.classes || raw.classids || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const subjectCodes = String(raw.subjects || raw.subjectids || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (classCodes.length && subjectCodes.length && classCodes.length !== subjectCodes.length) {
      summary.errors.push({
        row: rowIndex,
        message: "classes and subjects lists must have the same length when pairing",
      });
      continue;
    }

    if (classCodes.length && subjectCodes.length) {
      for (let j = 0; j < classCodes.length; j += 1) {
        if (!mongoose.Types.ObjectId.isValid(classCodes[j]) || !mongoose.Types.ObjectId.isValid(subjectCodes[j])) {
          summary.errors.push({ row: rowIndex, message: "Invalid ObjectId in assignments" });
          assignments.length = 0;
          break;
        }
        assignments.push({
          classId: classCodes[j],
          subjectId: subjectCodes[j],
        });
      }
      if (!assignments.length && classCodes.length) {
        continue;
      }
    }

    prepared.push({
      rowIndex,
      payload: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone: raw.phone || "",
        employeeId: raw.employeeid || raw.employee_id || "",
        assignments,
      },
      duplicateId: duplicate ? duplicate._id : null,
    });
  }

  return { summary, prepared };
}

export async function commitStudents(prepared) {
  const results = [];
  for (const row of prepared) {
    if (row.duplicateId) {
      const updated = await Student.findByIdAndUpdate(row.duplicateId, row.payload, {
        new: true,
      }).lean();
      results.push(updated);
    } else {
      const created = await Student.create(row.payload);
      results.push(created.toObject());
    }
  }
  return results;
}

export async function commitTeachers(prepared) {
  const results = [];
  for (const row of prepared) {
    if (row.duplicateId) {
      const updated = await Teacher.findByIdAndUpdate(row.duplicateId, row.payload, {
        new: true,
      }).lean();
      results.push(updated);
    } else {
      const created = await Teacher.create(row.payload);
      results.push(created.toObject());
    }
  }
  return results;
}
