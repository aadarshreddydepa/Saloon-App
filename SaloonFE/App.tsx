import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import notificationService from './src/services/notificationService';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

export default function App() {
  const colorScheme = useColorScheme();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Register for push notifications
    registerNotifications();

    // Add notification listeners
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('📩 Notification received:', notification);
        // Handle notification received while app is open
      }
    );

    responseListener.current = notificationService.addNotificationResponseListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        // Handle notification tap - navigate to relevant screen
        handleNotificationTap(response);
      }
    );

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
      console.log('✅ App registered for notifications');
      // TODO: Send token to backend to store in user profile
    }
  };

  const handleNotificationTap = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    // Navigate based on notification type
    // This will be implemented with navigation reference
    console.log('Navigation would happen here based on:', data);
  };

  return (
    <>
      <AppNavigator />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
