import { StyleSheet, Text, View } from "react-native";

export default function AdminTools() {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Import & export</Text>
      <Text style={styles.body}>
        Bulk CSV / Excel import and export is available on the web admin console where file pickers and spreadsheets work
        best. Use the same Clerk account there; your role and data stay in sync with this app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "700", color: "#0f172a", marginBottom: 10 },
  body: { fontSize: 15, color: "#475569", lineHeight: 22 },
});
