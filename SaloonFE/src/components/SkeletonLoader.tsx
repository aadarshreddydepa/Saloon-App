import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, useColorScheme } from "react-native";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export default function SkeletonLoader({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const isDark = useColorScheme() === "dark";
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? "#2C2C2E" : "#E5E5EA",
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {},
});

export function ProfileSkeleton() {
  const isDark = useColorScheme() === "dark";
  return (
    <View style={styles.profileSkeleton}>
      <SkeletonLoader
        width={100}
        height={100}
        borderRadius={50}
        style={{ marginBottom: 16 }}
      />
      <SkeletonLoader width={150} height={24} style={{ marginBottom: 8 }} />
      <SkeletonLoader width={200} height={16} style={{ marginBottom: 12 }} />
      <SkeletonLoader width={100} height={28} borderRadius={14} />
    </View>
  );
}

const profileSkeletonStyles = StyleSheet.create({
  profileSkeleton: {
    alignItems: "center",
    paddingVertical: 24,
  },
});

Object.assign(styles, profileSkeletonStyles);
