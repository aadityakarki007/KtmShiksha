import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  },
  { _id: false }
);

const TeacherSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, default: "" },
    employeeId: { type: String, default: "" },
    clerkUserId: { type: String, default: "", index: true },
    assignments: { type: [AssignmentSchema], default: [] },
  },
  { timestamps: true, strictPopulate: false }
);

const existingTeacherModel = mongoose.models.Teacher;
const hasSectionInAssignments = existingTeacherModel?.schema
  ?.path("assignments")
  ?.schema?.path("sectionId");

if (existingTeacherModel && !hasSectionInAssignments) {
  delete mongoose.models.Teacher;
}

export default mongoose.models.Teacher || mongoose.model("Teacher", TeacherSchema);
