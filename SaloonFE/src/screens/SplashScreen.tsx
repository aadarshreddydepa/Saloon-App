import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  useColorScheme,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../config/fonts";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace("Login" as never);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const bgColor = isDark ? "#000000" : "#F5F5F5";
  const textColor = isDark ? "#C0C0C0" : "#000000";
  const accentColor = isDark ? "#808080" : "#666666";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Animated.View
        style={[
          styles.iconContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={[styles.circle, { borderColor: textColor }]}>
          <Ionicons name="cut" size={80} color={textColor} />
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={[styles.title, { color: textColor }]}>Salon Booking</Text>
        <Text style={[styles.subtitle, { color: accentColor }]}>
          Your Style, Your Time
        </Text>
      </Animated.View>

      <Animated.View style={[styles.loader, { opacity: fadeAnim }]}>
        <View style={[styles.loaderBar, { backgroundColor: accentColor }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  iconContainer: { marginBottom: 30 },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(192,192,192,0.1)",
  },
  title: {
    fontSize: 36,
    fontFamily: fonts.heading.bold,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.body.regular,
    textAlign: "center",
    opacity: 0.9,
  },
  loader: {
    position: "absolute",
    bottom: 80,
    width: width * 0.6,
    height: 4,
    backgroundColor: "rgba(192,192,192,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  loaderBar: { height: "100%", width: "60%", borderRadius: 2 },
});
