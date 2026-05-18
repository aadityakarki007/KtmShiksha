import "react-native-gesture-handler";

import { ClerkProvider, type TokenCache } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { getClerkPublishableKey } from "@/lib/api";

const tokenCache: TokenCache = {
  async getToken(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      if (value) await SecureStore.setItemAsync(key, value);
      else await SecureStore.deleteItemAsync(key);
    } catch {
      /* ignore */
    }
  },
};

const publishableKey = getClerkPublishableKey();

export default function RootLayout() {
  if (!publishableKey) {
    return (
      <GestureHandlerRootView style={styles.flex}>
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>Configuration needed</Text>
          <Text style={styles.missingBody}>
            Create mobile/.env with EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY (same as NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) and
            EXPO_PUBLIC_API_BASE_URL (your deployed Next.js origin, no trailing slash).
          </Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerShadowVisible: false,
              headerTintColor: "#047857",
              contentStyle: { backgroundColor: "#f1f5f9" },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="sign-in" options={{ title: "Sign in" }} />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
            <Stack.Screen name="teacher" options={{ headerShown: false }} />
            <Stack.Screen name="student" options={{ headerShown: false }} />
          </Stack>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  missing: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f8fafc" },
  missingTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a", marginBottom: 12 },
  missingBody: { fontSize: 15, color: "#475569", lineHeight: 22 },
});
