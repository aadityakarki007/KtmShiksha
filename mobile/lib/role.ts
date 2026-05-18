export type Role = "admin" | "teacher" | "student";

export function resolveRole(
  metadata: Record<string, unknown> | null | undefined
): Role {
  const r = metadata?.role;
  if (r === "admin" || r === "teacher" || r === "student") return r;
  return "student";
}
