import { useClerk, useUser } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { resolveRole } from "@/lib/role";

export default function TeacherLayout() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0369a1" />
      </View>
    );
  }

  const role = resolveRole(user?.publicMetadata as Record<string, unknown>);
  if (role !== "teacher") {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: "#0369a1",
        contentStyle: { backgroundColor: "#f1f5f9" },
        headerRight: () => (
          <Pressable onPress={() => signOut()} style={{ paddingHorizontal: 12 }}>
            <Text style={{ color: "#0369a1", fontWeight: "700" }}>Sign out</Text>
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Teacher" }} />
      <Stack.Screen name="classes" options={{ title: "My classes" }} />
      <Stack.Screen name="attendance" options={{ title: "Attendance" }} />
      <Stack.Screen name="marks" options={{ title: "Marks" }} />
      <Stack.Screen name="notices" options={{ title: "Notices" }} />
    </Stack>
  );
}
