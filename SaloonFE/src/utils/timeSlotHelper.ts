/**
 * Generate available time slots for appointment booking
 * Only allows slots from current time onwards
 */

const TIME_SLOT_INTERVAL = 30; // 30-minute slots

export const getAvailableTimeSlots = (
  selectedDate: string,
  salonOpeningTime: string,
  salonClosingTime: string
): string[] => {
  const slots: string[] = [];
  const now = new Date();
  const selectedDateTime = new Date(selectedDate);
  
  const [openHour, openMin] = salonOpeningTime.split(':').map(Number);
  const [closeHour, closeMin] = salonClosingTime.split(':').map(Number);

  let currentSlotTime = new Date(selectedDateTime);
  currentSlotTime.setHours(openHour, openMin, 0, 0);

  const closingDateTime = new Date(selectedDateTime);
  closingDateTime.setHours(closeHour, closeMin, 0, 0);

  while (currentSlotTime < closingDateTime) {
    // Only add slots that are in the future
    if (currentSlotTime > now) {
      const hours = String(currentSlotTime.getHours()).padStart(2, '0');
      const minutes = String(currentSlotTime.getMinutes()).padStart(2, '0');
      slots.push(`${hours}:${minutes}`);
    }

    currentSlotTime.setMinutes(currentSlotTime.getMinutes() + TIME_SLOT_INTERVAL);
  }

  return slots;
};

export const getMinimumBookingDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export const canBookTodayAfter = (currentTime: string): boolean => {
  const [hour, min] = currentTime.split(':').map(Number);
  const now = new Date();
  const bookingTime = new Date();
  bookingTime.setHours(hour, min, 0, 0);

  // Can book if at least 30 minutes from now
  const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);
  
  return bookingTime > thirtyMinutesLater;
};

export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-IN', options);
};
