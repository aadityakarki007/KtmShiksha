import { StyleSheet, Text, View } from "react-native";

type Stat = { label: string; value: number | string };

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <View style={styles.grid}>
      {stats.map((s) => (
        <View key={s.label} style={styles.card}>
          <Text style={styles.value}>{s.value}</Text>
          <Text style={styles.label}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  card: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  value: { fontSize: 22, fontWeight: "700", color: "#047857" },
  label: { fontSize: 12, color: "#64748b", marginTop: 4 },
});
