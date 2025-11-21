import React, { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  useColorScheme,
  Platform,
  View,
  ActivityIndicator,
} from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import notificationService from "./src/services/notificationService";
import * as Notifications from "expo-notifications";
import { useFonts } from "expo-font";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_800ExtraBold,
  PlayfairDisplay_900Black,
} from "@expo-google-fonts/playfair-display";
import {
  Lora_400Regular,
  Lora_500Medium,
  Lora_600SemiBold,
  Lora_700Bold,
} from "@expo-google-fonts/lora";

export default function App() {
  const colorScheme = useColorScheme();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>(null);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_800ExtraBold,
    PlayfairDisplay_900Black,
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
    Lora_700Bold,
  });

  useEffect(() => {
    // Register for push notifications (will gracefully fail in Expo Go)
    registerNotifications();

    // Add notification listeners (works for local notifications in Expo Go)
    notificationListener.current =
      notificationService.addNotificationReceivedListener((notification) => {
        console.log(
          "📩 Notification received:",
          notification.request.content.title
        );
      });

    responseListener.current =
      notificationService.addNotificationResponseListener((response) => {
        console.log(
          "👆 Notification tapped:",
          response.notification.request.content.title
        );
        // Handle notification tap - navigate to relevant screen
      });

    // Show info if running in Expo Go
    if (notificationService.isRunningInExpoGo()) {
      console.log("📱 Running in Expo Go - Local notifications only");
      console.log("💡 To test push notifications, build a development build:");
      console.log("   npx expo install expo-dev-client");
      console.log("   npx expo run:android or npx expo run:ios");
    }

    // Cleanup
    return () => {
      if (notificationListener.current) {
        notificationService.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        notificationService.removeNotificationSubscription(
          responseListener.current
        );
      }
    };
  }, []);

  const registerNotifications = async () => {
    const token = await notificationService.registerForPushNotifications();
    if (token) {
      console.log("✅ App registered for push notifications");
    } else {
      console.log("ℹ️ Using local notifications only");
    }
  };

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colorScheme === "dark" ? "#000" : "#F2F2F7",
        }}
      >
        <ActivityIndicator
          size="large"
          color={colorScheme === "dark" ? "#0A84FF" : "#007AFF"}
        />
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </>
  );
}
