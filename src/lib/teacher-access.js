export function teacherTeachesClass(teacher, classId) {
  if (!teacher?.assignments?.length || !classId) return false;
  return teacher.assignments.some((a) => String(a.classId) === String(classId));
}

export function teacherTeachesClassSubject(teacher, classId, subjectId) {
  if (!teacher?.assignments?.length || !classId || !subjectId) return false;
  return teacher.assignments.some(
    (a) => String(a.classId) === String(classId) && String(a.subjectId) === String(subjectId)
  );
}
