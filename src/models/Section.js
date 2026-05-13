import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

SectionSchema.index({ classId: 1, name: 1 }, { unique: true });

export default mongoose.models.Section || mongoose.model("Section", SectionSchema);
