import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    audience: {
      type: String,
      enum: ["all", "students", "teachers", "admins"],
      default: "all",
      index: true,
    },
    pinned: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },
    createdByClerkId: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);
