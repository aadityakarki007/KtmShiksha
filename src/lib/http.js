import { NextResponse } from "next/server";

export function jsonOk(data, init = {}) {
  return NextResponse.json(data, { status: init.status ?? 200, ...init });
}

export function jsonError(message, status = 400, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function parseBody(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
