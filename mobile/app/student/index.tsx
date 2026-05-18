import { MenuLink } from "@/components/MenuLink";
import { useAuthorizedFetch } from "@/hooks/useAuthorizedFetch";
import { useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

type AttRow = {
  classId?: { name?: string; level?: string | number };
  sectionId?: { name?: string };
};

export default function StudentHome() {
  const { user } = useUser();
  const authFetch = useAuthorizedFetch();
  const [summary, setSummary] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await authFetch<{ data: AttRow[] }>("/api/attendance?limit=1");
        const row = json.data?.[0];
        const parts = [row?.classId?.name, row?.sectionId?.name].filter(Boolean);
        if (!cancelled) setSummary(parts.length ? parts.join(" · ") : null);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Could not load class info");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authFetch]);

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#b45309" />
      </View>
    );
  }

  const display = user?.firstName || user?.username || "Student";

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.heading}>Welcome, {display}</Text>
      {summary ? <Text style={styles.sub}>Class: {summary}</Text> : null}
      {err ? <Text style={styles.warn}>{err}</Text> : null}
      {!summary && !err ? (
        <Text style={styles.sub}>Your class will appear here once attendance exists.</Text>
      ) : null}

      <MenuLink href="/student/attendance" title="Attendance" icon="calendar-outline" />
      <MenuLink href="/student/marks" title="Marks & reports" icon="trophy-outline" />
      <MenuLink href="/student/notices" title="Notices" icon="megaphone-outline" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  sub: { fontSize: 15, color: "#475569", marginTop: 8, marginBottom: 16 },
  warn: { fontSize: 14, color: "#b45309", marginBottom: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
});
