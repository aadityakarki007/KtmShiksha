import { auth, currentUser } from "@clerk/nextjs/server";

export function resolveRole(publicMetadata) {
  const role = publicMetadata?.role;
  if (role === "admin" || role === "teacher" || role === "student") {
    return role;
  }
  return "student";
}

export async function getSessionRole() {
  const user = await currentUser();
  if (!user) return null;
  return resolveRole(user.publicMetadata);
}

export async function requireApiAuth(options = {}) {
  const { allowedRoles } = options;
  const user = await currentUser();

  if (!user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const role = resolveRole(user.publicMetadata);

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return { ok: true, userId: user.id, role, clerkUser: user };
}

export async function getTeacherRecord(Teacher, userId) {
  return Teacher.findOne({ clerkUserId: userId }).lean();
}

export async function getStudentRecord(Student, userId) {
  return Student.findOne({ clerkUserId: userId }).lean();
}

export async function getOptionalAuthContext() {
  const user = await currentUser();
  if (!user) {
    return { userId: null, role: null };
  }
  return { userId: user.id, role: resolveRole(user.publicMetadata) };
}
