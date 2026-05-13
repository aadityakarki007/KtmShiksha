import { connectDB } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/auth";
import { importRunSchema, importCommitPreparedSchema } from "@/lib/validations";
import { jsonError, jsonOk, parseBody } from "@/lib/http";
import { parseWorkbookBuffer } from "@/lib/excel";
import {
  validateStudentRows,
  validateTeacherRows,
  commitStudents,
  commitTeachers,
} from "@/lib/import-helpers";

export async function POST(req) {
  const gate = await requireApiAuth({ allowedRoles: ["admin"] });
  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  const contentType = req.headers.get("content-type") || "";

  let jsonBody = null;
  if (contentType.includes("application/json")) {
    jsonBody = await parseBody(req);
  }

  if (jsonBody?.mode === "commitPrepared") {
    const parsed = importCommitPreparedSchema.safeParse(jsonBody);
    if (!parsed.success) {
      return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
    }

    await connectDB();

    const { entity, duplicateStrategy, prepared } = parsed.data;

    if (!prepared.length) {
      return jsonError("Nothing to commit", 400);
    }

    if (entity === "students") {
      const committed = await commitStudents(prepared);
      return jsonOk({
        mode: "commitPrepared",
        entity,
        duplicateStrategy,
        results: committed,
      });
    }

    const committed = await commitTeachers(prepared);
    return jsonOk({
      mode: "commitPrepared",
      entity,
      duplicateStrategy,
      results: committed,
    });
  }

  let payload = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    const entity = form.get("entity");
    const mode = form.get("mode");
    const duplicateStrategy = form.get("duplicateStrategy") ?? "skip";

    if (!(file instanceof Blob)) {
      return jsonError("file is required", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rows = parseWorkbookBuffer(buffer);

    payload = {
      entity,
      mode,
      duplicateStrategy,
      rows,
    };
  } else if (contentType.includes("application/json")) {
    payload = jsonBody;
  } else {
    return jsonError("Unsupported content type", 415);
  }

  const parsed = importRunSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 422);
  }

  await connectDB();

  const { entity, mode, duplicateStrategy, rows } = parsed.data;

  if (!rows.length) {
    return jsonError("rows array is empty", 400);
  }

  if (entity === "students") {
    const { summary, prepared } = await validateStudentRows(rows, duplicateStrategy);

    if (mode === "preview") {
      return jsonOk({
        mode: "preview",
        entity,
        summary,
        prepared,
      });
    }

    const committed = await commitStudents(prepared);
    return jsonOk({
      mode: "commit",
      entity,
      summary,
      results: committed,
    });
  }

  const { summary, prepared } = await validateTeacherRows(rows, duplicateStrategy);

  if (mode === "preview") {
    return jsonOk({
      mode: "preview",
      entity,
      summary,
      prepared,
    });
  }

  const committed = await commitTeachers(prepared);
  return jsonOk({
    mode: "commit",
    entity,
    summary,
    results: committed,
  });
}
