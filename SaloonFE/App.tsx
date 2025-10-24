import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import notificationService from './src/services/notificationService';
import * as Notifications from 'expo-notifications';

export default function App() {
  const colorScheme = useColorScheme();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Register for push notifications (will gracefully fail in Expo Go)
    registerNotifications();

    // Add notification listeners (works for local notifications in Expo Go)
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('📩 Notification received:', notification.request.content.title);
      }
    );

    responseListener.current = notificationService.addNotificationResponseListener(
      (response) => {
        console.log('👆 Notification tapped:', response.notification.request.content.title);
        // Handle notification tap - navigate to relevant screen
      }
    );

    // Show info if running in Expo Go
    if (notificationService.isRunningInExpoGo()) {
      console.log('📱 Running in Expo Go - Local notifications only');
      console.log('💡 To test push notifications, build a development build:');
      console.log('   npx expo install expo-dev-client');
      console.log('   npx expo run:android or npx expo run:ios');
    }

    // Cleanup
    return () => {
      if (notificationListener.current) {
        notificationService.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        notificationService.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const registerNotifications = async () => {
    const token = await notificationService.registerForPushNotifications();
    if (token) {
      console.log('✅ App registered for push notifications');
    } else {
      console.log('ℹ️ Using local notifications only');
    }
  };

  return (
    <>
      <AppNavigator />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
