import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface PasswordStrengthMeterProps {
  password: string;
  isDark?: boolean;
}

export default function PasswordStrengthMeter({
  password,
  isDark,
}: PasswordStrengthMeterProps) {
  const getStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: "", color: "#E5E5EA" };

    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 10) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    const levels = [
      { level: 0, label: "", color: "#E5E5EA" },
      { level: 1, label: "Weak", color: "#FF3B30" },
      { level: 2, label: "Fair", color: "#FF9500" },
      { level: 3, label: "Good", color: "#FFCC00" },
      { level: 4, label: "Strong", color: "#34C759" },
      { level: 5, label: "Very Strong", color: "#30D158" },
    ];

    return levels[strength];
  };

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {[1, 2, 3, 4, 5].map((level) => (
          <View
            key={level}
            style={[
              styles.bar,
              {
                backgroundColor:
                  level <= strength.level ? strength.color : "#E5E5EA",
              },
            ]}
          />
        ))}
      </View>
      {strength.label && (
        <Text style={[styles.label, { color: strength.color }]}>
          {strength.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 8,
  },
  bars: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 4,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
