import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * Register for push notifications and get token
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Check if running on physical device
      if (!Device.isDevice) {
        console.log('⚠️ Push notifications only work on physical devices');
        return null;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // If still not granted, return null
      if (finalStatus !== 'granted') {
        console.log('❌ Push notification permission denied');
        return null;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = tokenData.data;
      console.log('✅ Push token:', this.expoPushToken);

      // Save token to AsyncStorage
      await AsyncStorage.setItem('push_token', this.expoPushToken);

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('❌ Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Get stored push token
   */
  async getPushToken(): Promise<string | null> {
    if (this.expoPushToken) {
      return this.expoPushToken;
    }

    const storedToken = await AsyncStorage.getItem('push_token');
    return storedToken;
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: trigger || null, // null = immediate
    });

    return identifier;
  }

  /**
   * Schedule reminder notification (1 hour before appointment)
   */
  async scheduleAppointmentReminder(
    appointmentDate: string,
    appointmentTime: string,
    salonName: string,
    serviceName: string
  ): Promise<void> {
    try {
      // Parse appointment date and time
      const [year, month, day] = appointmentDate.split('-').map(Number);
      const [hour, minute] = appointmentTime.split(':').map(Number);

      const appointmentDateTime = new Date(year, month - 1, day, hour, minute);
      const reminderTime = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000); // 1 hour before

      // Don't schedule if reminder time is in the past
      if (reminderTime.getTime() < Date.now()) {
        console.log('⚠️ Reminder time is in the past, skipping');
        return;
      }

      await this.scheduleLocalNotification(
        '⏰ Appointment Reminder',
        `Your appointment at ${salonName} for ${serviceName} is in 1 hour!`,
        { type: 'reminder' },
        { date: reminderTime }
      );

      console.log('✅ Reminder scheduled for:', reminderTime);
    } catch (error) {
      console.error('❌ Error scheduling reminder:', error);
    }
  }

  /**
   * Send immediate notification
   */
  async sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
    await this.scheduleLocalNotification(title, body, data);
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Add notification listener
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Remove notification listener
   */
  removeNotificationSubscription(subscription: Notifications.Subscription): void {
    Notifications.removeNotificationSubscription(subscription);
  }
}

export default new NotificationService();
