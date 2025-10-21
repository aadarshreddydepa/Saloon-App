import notificationService from '../services/notificationService';

export const NotificationTypes = {
  // Customer notifications
  BOOKING_CONFIRMED: 'booking_confirmed',
  SERVICE_STARTED: 'service_started',
  SERVICE_COMPLETED: 'service_completed',
  BOOKING_CANCELLED: 'booking_cancelled',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  
  // Barber notifications
  NEW_BOOKING: 'new_booking',
  CUSTOMER_CANCELLED: 'customer_cancelled',
  
  // Owner notifications
  NEW_JOIN_REQUEST: 'new_join_request',
  DAILY_SUMMARY: 'daily_summary',
};

/**
 * Customer Notifications
 */
export const notifyBookingConfirmed = async (
  salonName: string,
  serviceName: string,
  date: string,
  time: string
) => {
  await notificationService.sendLocalNotification(
    '✅ Booking Confirmed!',
    `Your appointment at ${salonName} for ${serviceName} on ${date} at ${time} has been confirmed by the barber.`,
    { type: NotificationTypes.BOOKING_CONFIRMED }
  );
};

export const notifyServiceStarted = async (
  salonName: string,
  serviceName: string
) => {
  await notificationService.sendLocalNotification(
    '✂️ Service Started',
    `Your ${serviceName} service at ${salonName} has begun. Enjoy!`,
    { type: NotificationTypes.SERVICE_STARTED }
  );
};

export const notifyServiceCompleted = async (
  salonName: string,
  serviceName: string
) => {
  await notificationService.sendLocalNotification(
    '✨ Service Completed',
    `Your ${serviceName} at ${salonName} is complete! Hope you enjoyed it. Please rate your experience.`,
    { type: NotificationTypes.SERVICE_COMPLETED }
  );
};

export const notifyBookingCancelled = async (
  salonName: string,
  reason?: string
) => {
  await notificationService.sendLocalNotification(
    '❌ Booking Cancelled',
    reason || `Your booking at ${salonName} has been cancelled.`,
    { type: NotificationTypes.BOOKING_CANCELLED }
  );
};

/**
 * Barber Notifications
 */
export const notifyBarberNewBooking = async (
  customerName: string,
  serviceName: string,
  date: string,
  time: string
) => {
  await notificationService.sendLocalNotification(
    '🔔 New Booking!',
    `${customerName} booked ${serviceName} for ${date} at ${time}. Tap to assign yourself.`,
    { type: NotificationTypes.NEW_BOOKING }
  );
};

export const notifyBarberCancellation = async (
  customerName: string,
  serviceName: string
) => {
  await notificationService.sendLocalNotification(
    '⚠️ Booking Cancelled',
    `${customerName} cancelled their ${serviceName} appointment.`,
    { type: NotificationTypes.CUSTOMER_CANCELLED }
  );
};

/**
 * Owner Notifications
 */
export const notifyOwnerJoinRequest = async (
  barberName: string,
  salonName: string
) => {
  await notificationService.sendLocalNotification(
    '👤 New Barber Request',
    `${barberName} wants to join ${salonName}. Review the request now.`,
    { type: NotificationTypes.NEW_JOIN_REQUEST }
  );
};

/**
 * Schedule appointment reminder
 */
export const scheduleAppointmentReminder = async (
  date: string,
  time: string,
  salonName: string,
  serviceName: string
) => {
  await notificationService.scheduleAppointmentReminder(
    date,
    time,
    salonName,
    serviceName
  );
};
