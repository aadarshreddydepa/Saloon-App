import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { bookingAPI, salonAPI } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import {
  getAvailableTimeSlots,
  getMinimumBookingDate,
  formatDateForDisplay,
  canBookTodayAfter,
} from "../../utils/timeSlotHelper";
import { fonts } from "../../config/fonts";

export default function BookAppointment() {
  const navigation = useNavigation();
  const route = useRoute();
  const isDark = useColorScheme() === "dark";
  const { user } = useAuthStore();

  const { salon, service } = route.params as any;

  const [bookingDate, setBookingDate] = useState(getMinimumBookingDate());
  const [bookingTime, setBookingTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [salonInfo, setSalonInfo] = useState<any>(null);

  const theme = isDark
    ? {
        bg: "#000000",
        card: "#1A1A1A",
        text: "#C0C0C0",
        primary: "#C0C0C0",
        inputBg: "#0D0D0D",
        border: "#333333",
      }
    : {
        bg: "#F5F5F5",
        card: "#FFFFFF",
        text: "#000000",
        primary: "#000000",
        inputBg: "#FAFAFA",
        border: "#E0E0E0",
      };

  useEffect(() => {
    fetchSalonInfo();
  }, []);

  useEffect(() => {
    if (salonInfo) {
      updateAvailableSlots();
    }
  }, [bookingDate, salonInfo]);

  const fetchSalonInfo = async () => {
    try {
      const response = await salonAPI.getById(salon.id);
      setSalonInfo(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load salon information");
    }
  };

  const updateAvailableSlots = () => {
    if (!salonInfo) return;

    const slots = getAvailableTimeSlots(
      bookingDate,
      salonInfo.opening_time,
      salonInfo.closing_time
    );

    setAvailableSlots(slots);
    setBookingTime("");
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      const minDate = getMinimumBookingDate();

      if (formattedDate >= minDate) {
        setBookingDate(formattedDate);
      } else {
        Alert.alert("Invalid Date", "Cannot book appointments in the past");
      }
    }
    setShowDatePicker(false);
  };

  const handleTimeSelect = (time: string) => {
    setBookingTime(time);
  };

  const handleBooking = async () => {
    if (!bookingTime) {
      Alert.alert("Error", "Please select a time slot");
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        salon: salon.id,
        service: service.id,
        booking_date: bookingDate,
        booking_time: bookingTime,
        notes: notes || "",
      };

      await bookingAPI.create(bookingData);

      Alert.alert("Success", "Appointment booked successfully!", [
        {
          text: "View Bookings",
          onPress: () => navigation.navigate("CustomerBookings" as never),
        },
        {
          text: "Continue",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Booking Failed",
        error.response?.data?.error || "Failed to book appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.card,
            borderBottomColor: theme.border,
            borderBottomWidth: 1,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Book Appointment
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Service Info */}
        <View style={[styles.section, { borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Service Details
          </Text>
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.infoRow}>
              <Text
                style={[styles.infoLabel, { color: theme.text, opacity: 0.7 }]}
              >
                Service
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {service.name}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.infoRow}>
              <Text
                style={[styles.infoLabel, { color: theme.text, opacity: 0.7 }]}
              >
                Duration
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {service.duration} mins
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.infoRow}>
              <Text
                style={[styles.infoLabel, { color: theme.text, opacity: 0.7 }]}
              >
                Price
              </Text>
              <Text style={[styles.infoValue, { color: "#4CAF50" }]}>
                ₹{service.price}
              </Text>
            </View>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Select Date
          </Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderWidth: 1,
              },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={24} color={theme.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={[
                  styles.dateButtonLabel,
                  { color: theme.text, opacity: 0.7 },
                ]}
              >
                Booking Date
              </Text>
              <Text style={[styles.dateButtonValue, { color: theme.text }]}>
                {formatDateForDisplay(bookingDate)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.dateHint, { color: theme.text, opacity: 0.6 }]}>
            ℹ️ Can only book from tomorrow onwards or for today after current
            time
          </Text>
        </View>

        {/* Time Slots - Scrollable Time Picker */}
        {availableSlots.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Select Time
            </Text>
            <Text
              style={[
                styles.timePickerHint,
                { color: theme.text, opacity: 0.6 },
              ]}
            >
              📅 Available slots from {salonInfo?.opening_time?.substring(0, 5)}{" "}
              to {salonInfo?.closing_time?.substring(0, 5)}
            </Text>

            {/* Scrollable Time Picker */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timePickerScrollContent}
              style={styles.timePickerScroll}
            >
              {availableSlots.map((time, index) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timePickerSlot,
                    {
                      backgroundColor:
                        bookingTime === time ? theme.primary : theme.card,
                      borderColor:
                        bookingTime === time ? theme.primary : theme.border,
                      borderWidth: 2,
                      marginLeft: index === 0 ? 0 : 8,
                    },
                  ]}
                  onPress={() => handleTimeSelect(time)}
                >
                  <Ionicons
                    name={bookingTime === time ? "time" : "time-outline"}
                    size={24}
                    color={
                      bookingTime === time
                        ? isDark
                          ? "#000"
                          : "#FFF"
                        : theme.text
                    }
                  />
                  <Text
                    style={[
                      styles.timePickerText,
                      {
                        color:
                          bookingTime === time
                            ? isDark
                              ? "#000"
                              : "#FFF"
                            : theme.text,
                        fontFamily:
                          bookingTime === time
                            ? fonts.heading.bold
                            : fonts.body.semiBold,
                      },
                    ]}
                  >
                    {time}
                  </Text>
                  {bookingTime === time && (
                    <View
                      style={[
                        styles.selectedIndicator,
                        { backgroundColor: isDark ? "#000" : "#FFF" },
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={theme.primary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View
            style={[
              styles.emptySlots,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderWidth: 1,
              },
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color={theme.text + "50"}
            />
            <Text style={[styles.emptySlotsText, { color: theme.text }]}>
              No available slots for this date
            </Text>
            <Text
              style={[
                styles.emptySlotsSubtext,
                { color: theme.text, opacity: 0.6 },
              ]}
            >
              Please select a different date
            </Text>
          </View>
        )}

        {/* Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Additional Notes
          </Text>
          <View
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderWidth: 1,
              },
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={20}
              color={theme.text}
            />
            <Text style={[styles.notesText, { color: theme.text }]}>
              {notes || "Add any special requests..."}
            </Text>
          </View>
        </View>

        {/* Booking Summary */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: "#4CAF5020",
              borderColor: "#4CAF50",
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.text }]}>
              Salon
            </Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {salon.name}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.text }]}>
              Date & Time
            </Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {bookingDate} {bookingTime || "—"}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.text }]}>
              Total Amount
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: "#4CAF50", fontWeight: "bold" },
              ]}
            >
              ₹{service.price}
            </Text>
          </View>
        </View>

        {/* Book Button */}
        <TouchableOpacity
          style={[
            styles.bookButton,
            {
              backgroundColor: bookingTime
                ? theme.primary
                : theme.primary + "50",
            },
          ]}
          onPress={handleBooking}
          disabled={!bookingTime || loading}
        >
          {loading ? (
            <ActivityIndicator color={isDark ? "#000" : "#FFF"} />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={isDark ? "#000" : "#FFF"}
              />
              <Text
                style={[
                  styles.bookButtonText,
                  { color: isDark ? "#000" : "#FFF", marginLeft: 10 },
                ]}
              >
                Confirm Booking
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(bookingDate)}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
          minimumDate={new Date(getMinimumBookingDate())}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontFamily: fonts.heading.bold },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.heading.semiBold,
    marginBottom: 12,
  },
  infoCard: { padding: 16, borderRadius: 16 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: { fontSize: 14, fontFamily: fonts.body.regular },
  infoValue: { fontSize: 16, fontFamily: fonts.body.semiBold },
  divider: { height: 1, marginVertical: 12 },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  dateButtonLabel: { fontSize: 13, fontFamily: fonts.body.regular },
  dateButtonValue: {
    fontSize: 16,
    fontFamily: fonts.heading.bold,
    marginTop: 2,
  },
  dateHint: { fontSize: 12, marginTop: 8, fontFamily: fonts.body.regular },

  // ✨ New Scrollable Time Picker Styles
  timePickerHint: {
    fontSize: 13,
    marginBottom: 12,
    fontFamily: fonts.body.regular,
  },
  timePickerScroll: {
    marginHorizontal: -20, // Extend to screen edges
    paddingHorizontal: 20,
  },
  timePickerScrollContent: {
    paddingRight: 20,
  },
  timePickerSlot: {
    minWidth: 110,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  timePickerText: {
    fontSize: 15,
    marginTop: 8,
  },
  selectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  emptySlots: {
    marginHorizontal: 20,
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
  },
  emptySlotsText: {
    fontSize: 16,
    fontFamily: fonts.body.semiBold,
    marginTop: 12,
  },
  emptySlotsSubtext: {
    fontSize: 14,
    marginTop: 6,
    fontFamily: fonts.body.regular,
  },
  notesInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  notesText: { marginLeft: 12, fontSize: 14, fontFamily: fonts.body.regular },
  summaryCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { fontSize: 14, fontFamily: fonts.body.regular },
  summaryValue: { fontSize: 14, fontFamily: fonts.body.semiBold },
  bookButton: {
    flexDirection: "row",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  bookButtonText: { fontSize: 16, fontFamily: fonts.heading.bold },
});
