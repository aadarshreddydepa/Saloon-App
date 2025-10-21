import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { bookingAPI } from '../../services/api';
import { scheduleAppointmentReminder } from '../../utils/notificationHelpers';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function BookAppointment() {
  const navigation = useNavigation();
  const route = useRoute();
  const isDark = useColorScheme() === 'dark';
  const { salon, service } = route.params as any;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const theme = isDark 
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', inputBg: '#0D0D0D' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', inputBg: '#FAFAFA' };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30',
  ];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select date and time');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        salon: salon.id,
        service: service.id,
        booking_date: selectedDate.toISOString().split('T')[0],
        booking_time: selectedTime + ':00',
        notes: notes,
      };

      await bookingAPI.create(bookingData);

      // 🔔 Schedule reminder notification (1 hour before)
      await scheduleAppointmentReminder(
        bookingData.booking_date,
        selectedTime,
        salon.name,
        service.name
      );

      Alert.alert(
        '🎉 Success!',
        'Booking created successfully!\n\n✅ You\'ll be notified when a barber accepts\n⏰ Reminder set for 1 hour before',
        [
          {
            text: 'View Bookings',
            onPress: () => navigation.navigate('Bookings' as never),
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Booking error:', error.response?.data);
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Book Appointment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.text, opacity: 0.6 }]}>Salon</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{salon.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.text, opacity: 0.6 }]}>Service</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{service.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.text, opacity: 0.6 }]}>Duration</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{service.duration} mins</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.text, opacity: 0.6 }]}>Price</Text>
            <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>₹{service.price}</Text>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Date</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.card }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={24} color={theme.primary} />
            <Text style={[styles.dateText, { color: theme.text }]}>
              {selectedDate.toDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              minimumDate={new Date()}
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) setSelectedDate(date);
              }}
            />
          )}
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Time</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  {
                    backgroundColor: selectedTime === time ? theme.primary : theme.card,
                    borderColor: selectedTime === time ? theme.primary : theme.border,
                  }
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[
                  styles.timeSlotText,
                  { color: selectedTime === time ? (isDark ? '#000' : '#FFF') : theme.text }
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Additional Notes (Optional)</Text>
          <View style={[styles.notesContainer, { backgroundColor: theme.card }]}>
            <TextInput
              style={[styles.notesInput, { color: theme.text }]}
              placeholder="Add any special requests or preferences..."
              placeholderTextColor={theme.text + '70'}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Notification Info */}
        <View style={[styles.infoBox, { backgroundColor: '#2196F320' }]}>
          <Ionicons name="notifications" size={20} color="#2196F3" />
          <Text style={[styles.infoText, { color: '#2196F3' }]}>
            You'll receive notifications when your booking is confirmed and 1 hour before the appointment
          </Text>
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={[styles.footer, { backgroundColor: theme.card }]}>
        <View style={styles.totalContainer}>
          <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount</Text>
          <Text style={[styles.totalAmount, { color: '#4CAF50' }]}>₹{service.price}</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleBooking}
          disabled={loading}
        >
          <Text style={[styles.bookButtonText, { color: isDark ? '#000' : '#FFF' }]}>
            {loading ? 'Booking...' : 'Confirm Booking'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  summaryCard: { margin: 20, padding: 20, borderRadius: 20 },
  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 15 },
  summaryValue: { fontSize: 15, fontWeight: '600' },
  dateButton: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 15 },
  dateText: { fontSize: 16, marginLeft: 15, fontWeight: '500' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  timeSlot: { width: '23%', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 10, borderWidth: 1.5 },
  timeSlotText: { fontSize: 14, fontWeight: '600' },
  notesContainer: { borderRadius: 15, padding: 15 },
  notesInput: { fontSize: 15, minHeight: 100 },
  infoBox: { marginHorizontal: 20, padding: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  infoText: { fontSize: 13, marginLeft: 10, flex: 1, lineHeight: 18 },
  footer: { paddingHorizontal: 20, paddingVertical: 20, borderTopWidth: 0 },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalLabel: { fontSize: 16 },
  totalAmount: { fontSize: 24, fontWeight: 'bold' },
  bookButton: { paddingVertical: 18, borderRadius: 15, alignItems: 'center' },
  bookButtonText: { fontSize: 18, fontWeight: 'bold' },
});
