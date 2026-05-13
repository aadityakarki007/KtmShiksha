import { z } from "zod";
import { ATTENDANCE_STATUS, GRADE_LEVELS, NOTICE_AUDIENCES } from "@/lib/constants";

const objectIdString = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const studentBodySchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  rollNumber: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  admissionDate: z.coerce.date().optional(),
  classId: objectIdString,
  sectionId: objectIdString,
  clerkUserId: z.string().optional(),
});

export const teacherBodySchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  employeeId: z.string().optional(),
  clerkUserId: z.string().optional(),
  assignments: z
    .array(
      z.object({
        classId: objectIdString,
        sectionId: objectIdString,
        subjectId: objectIdString,
      })
    )
    .optional(),
});

export const classBodySchema = z.object({
  name: z.string().min(1),
  level: z.enum(GRADE_LEVELS),
  academicYear: z.string().optional(),
});

export const sectionBodySchema = z.object({
  name: z.string().min(1),
  classId: objectIdString,
});

export const subjectBodySchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
});

export const attendanceBodySchema = z.object({
  date: z.coerce.date(),
  studentId: objectIdString,
  classId: objectIdString,
  sectionId: objectIdString,
  status: z.enum(ATTENDANCE_STATUS),
  markedBy: objectIdString.optional(),
  note: z.string().optional(),
});

export const attendanceBulkSchema = z.object({
  date: z.coerce.date(),
  classId: objectIdString,
  sectionId: objectIdString,
  entries: z.array(
    z.object({
      studentId: objectIdString,
      status: z.enum(ATTENDANCE_STATUS),
      note: z.string().optional(),
    })
  ),
});

export const examBodySchema = z.object({
  name: z.string().min(1),
  classId: objectIdString,
  subjectId: objectIdString,
  academicYear: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  maxScore: z.coerce.number().min(0).optional(),
  examType: z.string().optional(),
});

export const markBodySchema = z.object({
  examId: objectIdString,
  subjectId: objectIdString,
  studentId: objectIdString,
  score: z.coerce.number(),
  maxScore: z.coerce.number().optional(),
  remarks: z.string().optional(),
});

export const noticeBodySchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  audience: z.enum(NOTICE_AUDIENCES).optional(),
  pinned: z.boolean().optional(),
  publishedAt: z.coerce.date().optional(),
});

export const importRunSchema = z.object({
  entity: z.enum(["students", "teachers"]),
  mode: z.enum(["preview", "commit"]),
  duplicateStrategy: z.enum(["skip", "update"]).default("skip"),
  rows: z.array(z.record(z.string(), z.any())),
});

export const importCommitPreparedSchema = z.object({
  entity: z.enum(["students", "teachers"]),
  mode: z.literal("commitPrepared"),
  duplicateStrategy: z.enum(["skip", "update"]).default("skip"),
  prepared: z.array(z.any()),
});

export const exportQuerySchema = z.object({
  type: z.enum(["students", "teachers", "attendance", "marks"]),
  format: z.enum(["xlsx", "csv"]).default("xlsx"),
  template: z.enum(["true", "false"]).optional(),
  classId: objectIdString.optional(),
  sectionId: objectIdString.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
