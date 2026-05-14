import { connectDB } from "@/lib/mongodb";
import Update from "@/models/Update";
import { requireApiAuth } from "@/lib/auth";
import { jsonError, jsonOk, parseBody } from "@/lib/http";

export async function PUT(req, { params }) {
  const gate = await requireApiAuth({ allowedRoles: ["admin"] });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  // Next.js App Router: params is now async
  const { id } = await params;

  const raw = await parseBody(req);
  const { title, content, imageUrl, pinned } = raw;

  if (!title || !content) {
    return jsonError("Title and content are required", 400);
  }

  await connectDB();

  const doc = await Update.findByIdAndUpdate(
    id,
    {
      title,
      content,
      imageUrl: imageUrl || "",
      pinned: pinned || false,
    },
    {
      returnDocument: "after", // replaces deprecated { new: true }
      runValidators: true,
    }
  );

  if (!doc) {
    return jsonError("Update not found", 404);
  }

  return jsonOk({ data: doc });
}

export async function DELETE(req, { params }) {
  const gate = await requireApiAuth({ allowedRoles: ["admin"] });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  // Next.js App Router: params is now async
  const { id } = await params;

  await connectDB();

  const doc = await Update.findByIdAndDelete(id);

  if (!doc) {
    return jsonError("Update not found", 404);
  }

  return jsonOk({ data: doc });
}