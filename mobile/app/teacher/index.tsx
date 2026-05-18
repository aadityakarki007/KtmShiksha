import { MenuLink } from "@/components/MenuLink";
import { useAuthorizedFetch } from "@/hooks/useAuthorizedFetch";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

type Assignment = {
  classId?: { name?: string; level?: string | number };
  sectionId?: { name?: string };
  subjectId?: { name?: string; code?: string };
};

type TeacherDoc = {
  firstName?: string;
  lastName?: string;
  assignments?: Assignment[];
};

export default function TeacherHome() {
  const authFetch = useAuthorizedFetch();
  const [doc, setDoc] = useState<TeacherDoc | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await authFetch<{ data: TeacherDoc[] }>("/api/teachers?limit=5");
        const first = json.data?.[0];
        if (!cancelled) setDoc(first ?? null);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load profile");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authFetch]);

  if (!doc && !err) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0369a1" />
      </View>
    );
  }

  if (err) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{err}</Text>
      </View>
    );
  }

  const name = `${doc?.firstName ?? ""} ${doc?.lastName ?? ""}`.trim() || "Teacher";
  const n = doc?.assignments?.length ?? 0;

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.heading}>Hello, {name}</Text>
      <Text style={styles.sub}>
        You have {n} class assignment{n === 1 ? "" : "s"}. Open a section below to review or record work.
      </Text>

      <MenuLink href="/teacher/classes" title="My classes" subtitle="Assignments by class" icon="school-outline" />
      <MenuLink href="/teacher/attendance" title="Attendance" icon="calendar-outline" />
      <MenuLink href="/teacher/marks" title="Marks" icon="trophy-outline" />
      <MenuLink href="/teacher/notices" title="Notices" icon="megaphone-outline" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  sub: { fontSize: 14, color: "#64748b", marginTop: 6, marginBottom: 16, lineHeight: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  error: { color: "#b91c1c", textAlign: "center" },
});
