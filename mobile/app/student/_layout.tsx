import { useClerk, useUser } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { resolveRole } from "@/lib/role";

export default function StudentLayout() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#b45309" />
      </View>
    );
  }

  const role = resolveRole(user?.publicMetadata as Record<string, unknown>);
  if (role !== "student") {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: "#b45309",
        contentStyle: { backgroundColor: "#f1f5f9" },
        headerRight: () => (
          <Pressable onPress={() => signOut()} style={{ paddingHorizontal: 12 }}>
            <Text style={{ color: "#b45309", fontWeight: "700" }}>Sign out</Text>
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Student" }} />
      <Stack.Screen name="attendance" options={{ title: "Attendance" }} />
      <Stack.Screen name="marks" options={{ title: "Marks" }} />
      <Stack.Screen name="notices" options={{ title: "Notices" }} />
    </Stack>
  );
}
