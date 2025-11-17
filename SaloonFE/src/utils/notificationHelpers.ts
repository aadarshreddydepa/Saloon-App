import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const IS_EXPO_GO = Constants.appOwnership === 'expo';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const initializeNotifications = async () => {
  try {
    if (!IS_EXPO_GO && Platform.OS !== 'web') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return null;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    }
  } catch (error) {
    // Silently handle errors
  }
};

initializeNotifications();

export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: any
) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    // Silently fail - notifications are optional
  }
};

export const notifyBookingConfirmed = async (
  salonName: string,
  serviceName: string,
  date: string,
  time: string
) => {
  await scheduleLocalNotification(
    '✅ Booking Confirmed!',
    `Your ${serviceName} at ${salonName} is confirmed for ${date} at ${time}`
  );
};

export const notifyServiceStarted = async (
  salonName: string,
  serviceName: string
) => {
  await scheduleLocalNotification(
    '✂️ Service Started',
    `Your ${serviceName} at ${salonName} has started`
  );
};

export const notifyServiceCompleted = async (
  salonName: string,
  serviceName: string
) => {
  await scheduleLocalNotification(
    '🎉 Service Completed',
    `Your ${serviceName} at ${salonName} is complete. Thank you!`
  );
};

export const notifyBookingCancelled = async (
  salonName: string,
  serviceName: string
) => {
  await scheduleLocalNotification(
    '❌ Booking Cancelled',
    `Your ${serviceName} booking at ${salonName} has been cancelled`
  );
};
