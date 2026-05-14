import { connectDB } from "@/lib/mongodb";
import Update from "@/models/Update";
import { requireApiAuth } from "@/lib/auth";
import { jsonError, jsonOk, parseBody } from "@/lib/http";
import { buildPagination } from "@/lib/pagination";

export async function GET(req) {
  await connectDB();

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 20;

  const filter = {};
  const total = await Update.countDocuments(filter);
  const meta = buildPagination({ page, limit }, total);

  const rows = await Update.find(filter)
    .sort({ pinned: -1, publishedAt: -1 })
    .skip(meta.skip)
    .limit(meta.limit)
    .lean();

  return jsonOk({ data: rows, pagination: meta });
}

export async function POST(req) {
  const gate = await requireApiAuth({ allowedRoles: ["admin"] });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  const raw = await parseBody(req);
  const { title, content, imageUrl, pinned } = raw;

  if (!title || !content) {
    return jsonError("Title and content are required", 400);
  }

  await connectDB();

  const doc = await Update.create({
    title,
    content,
    imageUrl: imageUrl || "",
    pinned: pinned || false,
  });

  return jsonOk({ data: doc }, { status: 201 });
}
