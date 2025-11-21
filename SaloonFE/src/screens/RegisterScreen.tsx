import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { authAPI } from "../services/api";
import { fonts } from "../config/fonts";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    phone: "",
    user_type: "customer",
  });
  const [loading, setLoading] = useState(false);
  const isDark = useColorScheme() === "dark";

  const theme = isDark
    ? {
        bg: "#000000",
        card: "#1A1A1A",
        text: "#C0C0C0",
        primary: "#C0C0C0",
        inputBg: "#0D0D0D",
        border: "#333333",
      }
    : {
        bg: "#F5F5F5",
        card: "#FFFFFF",
        text: "#000000",
        primary: "#000000",
        inputBg: "#FFFFFF",
        border: "#E0E0E0",
      };

  const userTypes = [
    { value: "customer", label: "Customer", icon: "person" },
    { value: "owner", label: "Salon Owner", icon: "business" },
    { value: "barber", label: "Barber", icon: "cut" },
  ];

  const handleRegister = async () => {
    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      Alert.alert(
        "Error",
        "Please fill in all required fields (username, email, password)"
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...registrationData } = formData;

      // 🔍 DEBUG: Log the data being sent
      console.log("📤 Registration Data Being Sent:");
      console.log("-----------------------------------");
      console.log("username:", registrationData.username);
      console.log("email:", registrationData.email);
      console.log("password:", registrationData.password ? "***" : "MISSING");
      console.log("user_type:", registrationData.user_type);
      console.log("first_name:", registrationData.first_name);
      console.log("last_name:", registrationData.last_name);
      console.log("phone:", registrationData.phone);
      console.log("-----------------------------------");
      console.log("Full payload:", JSON.stringify(registrationData, null, 2));

      const response = await authAPI.register(registrationData);

      console.log("✅ Registration successful:", response.data);

      Alert.alert(
        "�� Success!",
        "Account created successfully! Please login.",
        [
          {
            text: "Login",
            onPress: () => navigation.navigate("Login" as never),
          },
        ]
      );
    } catch (error: any) {
      console.error("❌ Registration error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      let errorMessage = "Registration failed. Please try again.";

      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === "object") {
          errorMessage = Object.entries(errors)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n");
        } else if (typeof errors === "string") {
          errorMessage = errors;
        }
      } else if (error.message === "Network Error") {
        errorMessage =
          "❌ Cannot connect to server.\n\nPlease check:\n1. Backend is running\n2. Correct IP address\n3. Same WiFi network";
      }

      Alert.alert("Registration Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          Create Account
        </Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>
          Sign up to get started
        </Text>

        {/* User Type Selection */}
        <View style={styles.userTypeContainer}>
          {userTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.userTypeButton,
                {
                  backgroundColor:
                    formData.user_type === type.value
                      ? theme.primary
                      : theme.inputBg,
                  borderColor:
                    formData.user_type === type.value
                      ? theme.primary
                      : theme.border,
                },
              ]}
              onPress={() => {
                console.log("User type selected:", type.value);
                setFormData({ ...formData, user_type: type.value });
              }}
            >
              <Ionicons
                name={type.icon as any}
                size={24}
                color={
                  formData.user_type === type.value
                    ? isDark
                      ? "#000"
                      : "#FFF"
                    : theme.text
                }
              />
              <Text
                style={[
                  styles.userTypeText,
                  {
                    color:
                      formData.user_type === type.value
                        ? isDark
                          ? "#000"
                          : "#FFF"
                        : theme.text,
                  },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Username */}
        <View
          style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}
        >
          <Ionicons name="person-outline" size={20} color={theme.text} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Username *"
            placeholderTextColor={theme.text + "70"}
            value={formData.username}
            onChangeText={(text) => {
              console.log("Username input:", text);
              setFormData({ ...formData, username: text });
            }}
            autoCapitalize="none"
          />
        </View>

        {/* Email */}
        <View
          style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}
        >
          <Ionicons name="mail-outline" size={20} color={theme.text} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Email *"
            placeholderTextColor={theme.text + "70"}
            value={formData.email}
            onChangeText={(text) => {
              console.log("Email input:", text);
              setFormData({ ...formData, email: text });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* First Name */}
        <View
          style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}
        >
          <Ionicons name="person-outline" size={20} color={theme.text} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="First Name"
            placeholderTextColor={theme.text + "70"}
            value={formData.first_name}
            onChangeText={(text) =>
              setFormData({ ...formData, first_name: text })
            }
          />
        </View>

        {/* Last Name */}
        <View
          style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}
        >
          <Ionicons name="person-outline" size={20} color={theme.text} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Last Name"
            placeholderTextColor={theme.text + "70"}
            value={formData.last_name}
            onChangeText={(text) =>
              setFormData({ ...formData, last_name: text })
            }
          />
        </View>

        {/* Phone */}
        <View
          style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}
        >
          <Ionicons name="call-outline" size={20} color={theme.text} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Phone"
            placeholderTextColor={theme.text + "70"}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />
        </View>

        {/* Password */}
        <View
          style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}
        >
          <Ionicons name="lock-closed-outline" size={20} color={theme.text} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Password *"
            placeholderTextColor={theme.text + "70"}
            value={formData.password}
            onChangeText={(text) => {
              console.log("Password entered:", text ? "YES" : "NO");
              setFormData({ ...formData, password: text });
            }}
            secureTextEntry
          />
        </View>

        {/* Confirm Password */}
        <View
          style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}
        >
          <Ionicons name="lock-closed-outline" size={20} color={theme.text} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Confirm Password *"
            placeholderTextColor={theme.text + "70"}
            value={formData.confirmPassword}
            onChangeText={(text) =>
              setFormData({ ...formData, confirmPassword: text })
            }
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[
            styles.registerButton,
            { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 },
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={isDark ? "#000" : "#FFF"} />
          ) : (
            <Text
              style={[
                styles.registerButtonText,
                { color: isDark ? "#000" : "#FFF" },
              ]}
            >
              Create Account
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate("Login" as never)}
        >
          <Text style={[styles.loginLinkText, { color: theme.text }]}>
            Already have an account?{" "}
            <Text style={{ color: theme.primary, fontWeight: "bold" }}>
              Login
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 32, fontFamily: fonts.heading.bold, marginBottom: 8 },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.body.regular,
    opacity: 0.7,
    marginBottom: 30,
  },
  userTypeContainer: { flexDirection: "row", marginBottom: 20 },
  userTypeButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 2,
  },
  userTypeText: { fontSize: 12, marginTop: 8, fontFamily: fonts.body.semiBold },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: fonts.body.regular,
  },
  registerButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  registerButtonText: { fontSize: 18, fontFamily: fonts.body.bold },
  loginLink: { marginTop: 20, alignItems: "center" },
  loginLinkText: { fontSize: 14, fontFamily: fonts.body.regular },
});
