import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, default: "", index: true },
    rollNumber: { type: String, default: "" },
    dateOfBirth: { type: Date },
    gender: { type: String, default: "" },
    address: { type: String, default: "" },
    parentName: { type: String, default: "" },
    parentPhone: { type: String, default: "" },
    house: { type: String, default: "" },
    emisId: { type: String, default: "" },
    admissionDate: { type: Date },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
      index: true,
    },
    clerkUserId: { type: String, default: "", index: true },
  },
  { timestamps: true }
);

StudentSchema.index({ classId: 1, sectionId: 1, rollNumber: 1 });

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
