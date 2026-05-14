import mongoose from "mongoose";

const UpdateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    publishedAt: { type: Date, default: Date.now },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Update || mongoose.model("Update", UpdateSchema);
