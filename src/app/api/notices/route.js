import { connectDB } from "@/lib/mongodb";
import Notice from "@/models/Notice";
import { requireApiAuth, getOptionalAuthContext } from "@/lib/auth";
import { noticeBodySchema, paginationSchema } from "@/lib/validations";
import { jsonError, jsonOk, parseBody } from "@/lib/http";
import { buildPagination, escapeRegex } from "@/lib/pagination";

export async function GET(req) {
  await connectDB();

  const ctx = await getOptionalAuthContext();

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsedPage = paginationSchema.safeParse(params);
  if (!parsedPage.success) {
    return jsonError(parsedPage.error.flatten().formErrors.join(", "), 400);
  }

  const { page, limit, search } = parsedPage.data;

  const audienceClause = {};
  if (!ctx.role) {
    audienceClause.audience = "all";
  } else if (ctx.role === "student") {
    audienceClause.$or = [{ audience: "all" }, { audience: "students" }];
  } else if (ctx.role === "teacher") {
    audienceClause.$or = [{ audience: "all" }, { audience: "teachers" }];
  } else if (ctx.role === "admin") {
    // no audience restriction
  }

  const filter = {};

  if (Object.keys(audienceClause).length > 0) {
    Object.assign(filter, audienceClause);
  }

  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$and = filter.$and ?? [];
    filter.$and.push({
      $or: [{ title: rx }, { body: rx }],
    });
  }

  const total = await Notice.countDocuments(filter);
  const meta = buildPagination({ page, limit }, total);

  const rows = await Notice.find(filter)
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
  const parsed = noticeBodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
  }

  await connectDB();

  const payload = {
    ...parsed.data,
    createdByClerkId: gate.userId,
    publishedAt: parsed.data.publishedAt ?? new Date(),
  };

  const doc = await Notice.create(payload);
  return jsonOk({ data: doc.toObject() }, { status: 201 });
}
