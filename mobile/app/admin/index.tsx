import { MenuLink } from "@/components/MenuLink";
import { StatGrid } from "@/components/StatGrid";
import { useAuthorizedFetch } from "@/hooks/useAuthorizedFetch";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

type StatsPayload = {
  students: number;
  teachers: number;
  classes: number;
  sections: number;
  subjects: number;
  attendanceRecords: number;
  exams: number;
  marks: number;
  notices: number;
};

export default function AdminHome() {
  const authFetch = useAuthorizedFetch();
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await authFetch<{ data: StatsPayload }>("/api/stats");
        if (!cancelled) setStats(json.data);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load stats");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authFetch]);

  if (!stats && !err) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#047857" />
      </View>
    );
  }

  if (err || !stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{err ?? "Unable to load"}</Text>
      </View>
    );
  }

  const statRows = [
    { label: "Students", value: stats.students },
    { label: "Teachers", value: stats.teachers },
    { label: "Classes", value: stats.classes },
    { label: "Sections", value: stats.sections },
    { label: "Subjects", value: stats.subjects },
    { label: "Attendance rows", value: stats.attendanceRecords },
    { label: "Exams", value: stats.exams },
    { label: "Marks", value: stats.marks },
    { label: "Notices", value: stats.notices },
  ];

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.heading}>Admin console</Text>
      <Text style={styles.sub}>Counts across your school data.</Text>
      <StatGrid stats={statRows} />

      <Text style={styles.section}>People & classes</Text>
      <MenuLink href="/admin/students" title="Students" subtitle="Directory & enrollment" icon="people-outline" />
      <MenuLink href="/admin/teachers" title="Teachers" subtitle="Staff & assignments" icon="person-outline" />
      <MenuLink href="/admin/classes" title="Classes & sections" icon="school-outline" />
      <MenuLink href="/admin/subjects" title="Subjects" icon="book-outline" />

      <Text style={styles.section}>Communications</Text>
      <MenuLink href="/admin/notices" title="Notices" icon="megaphone-outline" />
      <MenuLink href="/admin/updates" title="Updates" icon="newspaper-outline" />

      <Text style={styles.section}>Academics</Text>
      <MenuLink href="/admin/exams" title="Exams" icon="clipboard-outline" />
      <MenuLink href="/admin/marks" title="Marks" icon="trophy-outline" />
      <MenuLink href="/admin/attendance" title="Attendance" icon="calendar-outline" />

      <Text style={styles.section}>Data tools</Text>
      <MenuLink href="/admin/tools" title="Import / export" subtitle="Use the web app for spreadsheets" icon="cloud-upload-outline" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  sub: { fontSize: 14, color: "#64748b", marginTop: 4, marginBottom: 16 },
  section: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 18,
    marginBottom: 8,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  error: { color: "#b91c1c", textAlign: "center" },
});
