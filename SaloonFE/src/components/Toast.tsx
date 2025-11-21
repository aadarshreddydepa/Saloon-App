import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  visible: boolean;
  onHide: () => void;
}

export default function Toast({ message, type, visible, onHide }: ToastProps) {
  const isDark = useColorScheme() === "dark";
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(-20);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const colors = {
    success: { bg: "#34C759", icon: "checkmark-circle" },
    error: { bg: "#FF3B30", icon: "close-circle" },
    info: { bg: "#007AFF", icon: "information-circle" },
  };

  const config = colors[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: config.bg,
        },
      ]}
    >
      <Ionicons name={config.icon as any} size={20} color="#FFF" />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
  },
});
