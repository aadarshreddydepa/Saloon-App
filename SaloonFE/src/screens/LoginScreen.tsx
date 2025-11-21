import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { authAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { fonts } from "../config/fonts";

export default function LoginScreen() {
  const navigation = useNavigation();
  const { setToken, setUser } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const isDark = useColorScheme() === "dark";

  const theme = isDark
    ? {
        bg: "#000000",
        card: "#1A1A1A",
        text: "#C0C0C0",
        primary: "#C0C0C0",
        border: "#333333",
        inputBg: "#0D0D0D",
      }
    : {
        bg: "#F5F5F5",
        card: "#FFFFFF",
        text: "#000000",
        primary: "#000000",
        border: "#E0E0E0",
        inputBg: "#F8F8F8",
      };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login({ username, password });
      await setToken(response.data.access);
      const profileResponse = await authAPI.getProfile();
      setUser(profileResponse.data);
      navigation.replace('Main' as never);
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.detail || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <Ionicons name="cut" size={60} color={theme.text} />
            <Text style={[styles.title, { color: theme.text }]}>
              Welcome Back!
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.text, opacity: 0.6 }]}
            >
              Login to continue
            </Text>
          </View>

          <View style={[styles.formContainer, { backgroundColor: theme.card }]}>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: theme.inputBg },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Username"
                placeholderTextColor={theme.text + "80"}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View
              style={[
                styles.inputContainer,
                { backgroundColor: theme.inputBg },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.text + "80"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: theme.primary }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text
                style={[
                  styles.loginButtonText,
                  { color: isDark ? "#000" : "#FFF" },
                ]}
              >
                {loading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text
                style={[
                  styles.registerText,
                  { color: theme.text, opacity: 0.6 },
                ]}
              >
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Register" as never)}
              >
                <Text style={[styles.registerLink, { color: theme.primary }]}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollView: { flexGrow: 1, justifyContent: "center", padding: 20 },
  header: { alignItems: "center", marginBottom: 40 },
  title: { fontSize: 32, fontFamily: fonts.heading.bold, marginTop: 20 },
  subtitle: { fontSize: 16, fontFamily: fonts.body.regular, marginTop: 8 },
  formContainer: {
    borderRadius: 30,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 16,
    height: 55,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, fontFamily: fonts.body.regular },
  loginButton: {
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  loginButtonText: { fontSize: 18, fontFamily: fonts.body.bold },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: { fontSize: 14, fontFamily: fonts.body.regular },
  registerLink: { fontSize: 14, fontFamily: fonts.body.bold },
});
