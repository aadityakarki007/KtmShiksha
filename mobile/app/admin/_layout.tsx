import { useClerk, useUser } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { resolveRole } from "@/lib/role";

export default function AdminLayout() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#047857" />
      </View>
    );
  }

  const role = resolveRole(user?.publicMetadata as Record<string, unknown>);
  if (role !== "admin") {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: "#047857",
        contentStyle: { backgroundColor: "#f1f5f9" },
        headerRight: () => (
          <Pressable onPress={() => signOut()} style={{ paddingHorizontal: 12 }}>
            <Text style={{ color: "#047857", fontWeight: "700" }}>Sign out</Text>
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Overview" }} />
      <Stack.Screen name="students" options={{ title: "Students" }} />
      <Stack.Screen name="teachers" options={{ title: "Teachers" }} />
      <Stack.Screen name="classes" options={{ title: "Classes" }} />
      <Stack.Screen name="subjects" options={{ title: "Subjects" }} />
      <Stack.Screen name="notices" options={{ title: "Notices" }} />
      <Stack.Screen name="updates" options={{ title: "Updates" }} />
      <Stack.Screen name="exams" options={{ title: "Exams" }} />
      <Stack.Screen name="marks" options={{ title: "Marks" }} />
      <Stack.Screen name="attendance" options={{ title: "Attendance" }} />
      <Stack.Screen name="tools" options={{ title: "Import / export" }} />
    </Stack>
  );
}
