import { Link, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IonName = ComponentProps<typeof Ionicons>["name"];

type Props = {
  href: Href;
  title: string;
  subtitle?: string;
  icon: IonName;
};

export function MenuLink({ href, title, subtitle, icon }: Props) {
  return (
    <Link href={href} asChild>
      <Pressable style={(state) => [styles.row, state.pressed && styles.pressed]}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color="#047857" />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  pressed: { opacity: 0.92 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textCol: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
});
