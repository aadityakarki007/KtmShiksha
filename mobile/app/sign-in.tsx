import { useClerk, useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, isLoaded } = useSignIn();
  const { setActive } = useClerk();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit() {
    if (!isLoaded || !signIn) return;
    setBusy(true);
    setMessage(null);
    try {
      const attempt = await signIn.create({
        identifier: email.trim(),
        password,
      });
      if (attempt.status === "complete" && attempt.createdSessionId) {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
        return;
      }
      setMessage("Additional sign-in steps are required. Complete them on the web app, or enable the same factors in Clerk for mobile.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.brand}>Kathmandu Shikshya</Text>
        <Text style={styles.tag}>School management</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@school.edu"
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#94a3b8"
        />

        {message ? <Text style={styles.error}>{message}</Text> : null}

        <Pressable
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={busy || !email.trim() || !password}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </Pressable>

        <Link href="/" asChild>
          <Pressable style={styles.linkBtn}>
            <Text style={styles.link}>Back to home</Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#f1f5f9" },
  inner: { flex: 1, padding: 24, paddingTop: 48, justifyContent: "center" },
  brand: { fontSize: 26, fontWeight: "800", color: "#0f172a", textAlign: "center" },
  tag: { fontSize: 15, color: "#64748b", textAlign: "center", marginBottom: 32 },
  label: { fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    color: "#0f172a",
  },
  button: {
    backgroundColor: "#047857",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  error: { color: "#b91c1c", marginBottom: 12, textAlign: "center" },
  linkBtn: { marginTop: 20, alignItems: "center" },
  link: { color: "#047857", fontWeight: "600" },
});
