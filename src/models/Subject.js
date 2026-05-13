import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);
