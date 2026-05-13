import mongoose from "mongoose";

const MarkSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    score: { type: Number, required: true },
    maxScore: { type: Number, default: 100 },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

MarkSchema.index({ examId: 1, studentId: 1, subjectId: 1 }, { unique: true });

export default mongoose.models.Mark || mongoose.model("Mark", MarkSchema);
