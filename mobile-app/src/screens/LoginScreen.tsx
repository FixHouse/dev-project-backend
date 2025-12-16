import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { authService } from "../auth/auth.service";
import { useAuthStore } from "../auth/auth.store";

export default function LoginScreen() {
  const setTokens = useAuthStore((s) => s.setTokens);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      Alert.alert("Помилка", "Введи email і пароль");
      return;
    }

    try {
      setLoading(true);

      // 1) login -> access + refresh
const { accessToken, refreshToken } = await authService.login({
  identifier: cleanEmail, // email або phone
  password,
});





      // 2) save tokens (SecureStore через zustand store)
      await setTokens(accessToken, refreshToken);

      // 3) test protected endpoint
      const me = await authService.me();

      Alert.alert(
        "Успіх ✅",
        `Role: ${me.role ?? "?"}\nUser: ${me.email ?? me.phone ?? me.id}`
      );
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "Невідома помилка";
      Alert.alert("Login error", String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", textAlign: "center" }}>
        Login
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
      />

      <Pressable
        onPress={onLogin}
        disabled={loading}
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 10,
          alignItems: "center",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Text style={{ fontWeight: "700" }}>
          {loading ? "..." : "Login"}
        </Text>
      </Pressable>
    </View>
  );
}
