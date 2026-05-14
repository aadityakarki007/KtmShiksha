function assignmentClassId(a) {
  return String(a.classId?._id ?? a.classId ?? "");
}

function assignmentSectionId(a) {
  return String(a.sectionId?._id ?? a.sectionId ?? "");
}

export function teacherTeachesClass(teacher, classId) {
  if (!teacher?.assignments?.length || !classId) return false;
  return teacher.assignments.some((a) => assignmentClassId(a) === String(classId));
}

export function teacherTeachesClassSection(teacher, classId, sectionId) {
  if (!teacher?.assignments?.length || !classId) return false;
  return teacher.assignments.some((a) => {
    if (assignmentClassId(a) !== String(classId)) return false;
    if (!sectionId) return true;
    return assignmentSectionId(a) === String(sectionId);
  });
}

export function teacherTeachesClassSubject(teacher, classId, subjectId) {
  if (!teacher?.assignments?.length || !classId || !subjectId) return false;
  return teacher.assignments.some((a) => {
    const sid = String(a.subjectId?._id ?? a.subjectId ?? "");
    return assignmentClassId(a) === String(classId) && sid === String(subjectId);
  });
}
