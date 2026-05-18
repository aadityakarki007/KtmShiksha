import { useRemoteList } from "@/hooks/useRemoteList";
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Row = { id: string; title: string; subtitle?: string };

export function JsonFlatList({
  endpoint,
  toRows,
}: {
  endpoint: string;
  toRows: (items: unknown[]) => Row[];
}) {
  const { loading, error, data, refreshing, onRefresh } = useRemoteList(endpoint);
  const rows = toRows(data);

  const renderItem: ListRenderItem<Row> = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      {item.subtitle ? <Text style={styles.sub}>{item.subtitle}</Text> : null}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#047857" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.hint}>Check EXPO_PUBLIC_API_BASE_URL and that you are signed in.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1 }}
      data={rows}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={rows.length === 0 ? styles.centerGrow : styles.listPad}
      ListEmptyComponent={<Text style={styles.empty}>No records.</Text>}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  centerGrow: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  listPad: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  title: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  sub: { fontSize: 14, color: "#64748b", marginTop: 4 },
  error: { color: "#b91c1c", textAlign: "center", fontSize: 15 },
  hint: { color: "#64748b", textAlign: "center", marginTop: 8, fontSize: 13 },
  empty: { color: "#64748b", fontSize: 15 },
});
