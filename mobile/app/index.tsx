import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { resolveRole } from "@/lib/role";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  if (!isLoaded || !userLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#047857" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  const role = resolveRole(user?.publicMetadata as Record<string, unknown>);
  if (role === "admin") return <Redirect href="/admin" />;
  if (role === "teacher") return <Redirect href="/teacher" />;
  return <Redirect href="/student" />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f1f5f9" },
});
