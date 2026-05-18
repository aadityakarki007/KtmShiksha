// src/lib/import-helpers.js
import mongoose from "mongoose";
import ClassModel from "@/models/Class";
import Section from "@/models/Section";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import { GRADE_LEVELS } from "@/lib/constants";

function excelSerialToDate(serial) {
  const n = Number(serial);
  if (!n || isNaN(n)) return undefined;
  return new Date(Math.round((n - 25569) * 86400 * 1000));
}

function normalizeHeader(key) {
  return String(key ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, ""); // Remove special characters like apostrophes, underscores, etc.
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

export async function validateStudentRows(rows, duplicateStrategy, defaultClassId = null, defaultSectionId = null) {
  const summary = { created: 0, updated: 0, skipped: 0, errors: [], duplicates: [] };
  const prepared = [];

  for (let i = 0; i < rows.length; i += 1) {
    const raw = normalizeRow(rows[i]);
    const rowIndex = i + 2;

    // Try to get separate firstName and lastName
    let firstName = raw.firstname || raw.first_name || "";
    let lastName = raw.lastname || raw.last_name || "";
    
    // If no separate names, try to parse full name from "Student's Name" column
    const fullName = raw.studentsname || raw.studentname || raw.student_name || raw.name || "";
    if (fullName && !firstName && !lastName) {
      // Parse full name into firstName and lastName
      const nameParts = String(fullName).trim().split(/\s+/);
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(" ");
      } else if (nameParts.length === 1) {
        firstName = nameParts[0];
        lastName = nameParts[0]; // Use first name for both if only one name provided
      }
    }

    const email = raw.email || "";
    const rollNumber = raw.rollnumber || raw.roll_number || raw.rollno || "";
    const level = raw.level || raw.grade || "";
    const className = raw.classname || raw.class_name || raw.class || "";
    const sectionName = raw.section || raw.sectionname || raw.section_name || "";
    const parentPhone = raw.parentphone || raw.parent_phone || raw.contactno || raw.contact_no || "";
    const parentName = raw.parentsname || raw.parentname || raw.parent_name || "";
    const dateOfBirth = raw.dateofbirth || raw.date_of_birth || raw.dob || "";
    const house = (raw.house && raw.house !== "-") ? String(raw.house) : "";
    const emisId = (raw.emisid && raw.emisid !== "-") ? String(raw.emisid)
             : (raw.emis_id && raw.emis_id !== "-") ? String(raw.emis_id) : "";
    const address = raw.address || "";

    if (!firstName || !lastName) {
      summary.errors.push({ row: rowIndex, message: "Student name is required (firstName, lastName, or Student's Name column)" });
      continue;
    }

    // If classId/sectionId provided from UI, use them; otherwise try to resolve from data
    let classId = defaultClassId;
    let sectionId = defaultSectionId;

    if (!classId || !sectionId) {
      if (!level || !sectionName) {
        summary.errors.push({ row: rowIndex, message: "level and section are required, or select them from import form" });
        continue;
      }

      const resolved = await resolveClassSection(level, className || level, sectionName);
      if (resolved.error) {
        summary.errors.push({ row: rowIndex, message: resolved.error });
        continue;
      }
      classId = resolved.classId;
      sectionId = resolved.sectionId;
    }

    let duplicate = null;
    if (email) {
      duplicate = await Student.findOne({ email }).lean();
    }
    if (!duplicate && rollNumber) {
      duplicate = await Student.findOne({
        rollNumber,
        classId,
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
        classId,
        sectionId,
        parentPhone,
        parentName,
        dateOfBirth: dateOfBirth
          ? (isNaN(Number(dateOfBirth)) ? new Date(dateOfBirth) : excelSerialToDate(dateOfBirth))
          : undefined,
        house,
        emisId,
        address,
        gender: raw.gender || "",
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
