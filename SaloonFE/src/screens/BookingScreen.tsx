import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { bookingAPI } from "../services/api";
import { fonts } from "../config/fonts";

export default function BookingScreen() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");

  const theme = isDark
    ? {
        bg: "#000000",
        card: "#1A1A1A",
        text: "#C0C0C0",
        primary: "#C0C0C0",
        inputBg: "#0D0D0D",
      }
    : {
        bg: "#F5F5F5",
        card: "#FFFFFF",
        text: "#000000",
        primary: "#000000",
        inputBg: "#FAFAFA",
      };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (bookingId: number) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await bookingAPI.cancel(bookingId);
              fetchBookings();
              Alert.alert("Success", "Booking cancelled successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to cancel booking");
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: "#FF9800",
      confirmed: "#2196F3",
      in_progress: "#9C27B0",
      completed: "#4CAF50",
      cancelled: "#F44336",
    };
    return colors[status] || "#808080";
  };

  const filteredBookings = bookings.filter((booking: any) => {
    const today = new Date().toISOString().split("T")[0];
    if (filter === "upcoming") {
      return (
        booking.booking_date >= today &&
        booking.status !== "completed" &&
        booking.status !== "cancelled"
      );
    } else {
      return (
        booking.booking_date < today ||
        booking.status === "completed" ||
        booking.status === "cancelled"
      );
    }
  });

  const renderBooking = ({ item }: any) => (
    <View style={[styles.bookingCard, { backgroundColor: theme.card }]}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={[styles.salonName, { color: theme.text }]}>
            {item.salon_name}
          </Text>
          <Text
            style={[styles.serviceName, { color: theme.text, opacity: 0.6 }]}
          >
            {item.service_name}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={18} color={theme.text} />
          <Text style={[styles.detailText, { color: theme.text }]}>
            {item.booking_date}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={18} color={theme.text} />
          <Text style={[styles.detailText, { color: theme.text }]}>
            {item.booking_time}
          </Text>
        </View>
        {item.barber_name && (
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={18} color={theme.text} />
            <Text style={[styles.detailText, { color: theme.text }]}>
              {item.barber_name}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.bookingFooter}>
        <Text style={[styles.price, { color: "#4CAF50" }]}>
          ₹{item.service_price}
        </Text>
        {item.status === "pending" || item.status === "confirmed" ? (
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: "#F4433620" }]}
            onPress={() => handleCancelBooking(item.id)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          My Bookings
        </Text>
      </View>

      <View style={[styles.filterContainer, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "upcoming" && { backgroundColor: theme.primary },
          ]}
          onPress={() => setFilter("upcoming")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color:
                  filter === "upcoming"
                    ? isDark
                      ? "#000"
                      : "#FFF"
                    : theme.text,
              },
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "past" && { backgroundColor: theme.primary },
          ]}
          onPress={() => setFilter("past")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color:
                  filter === "past" ? (isDark ? "#000" : "#FFF") : theme.text,
              },
            ]}
          >
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={renderBooking}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchBookings} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="calendar-outline"
              size={80}
              color={theme.text + "50"}
            />
            <Text style={[styles.emptyText, { color: theme.text }]}>
              {filter === "upcoming"
                ? "No upcoming bookings"
                : "No past bookings"}
            </Text>
            <TouchableOpacity
              style={[styles.browseButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate("Home" as never)}
            >
              <Text
                style={[
                  styles.browseButtonText,
                  { color: isDark ? "#000" : "#FFF" },
                ]}
              >
                Browse Salons
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontFamily: fonts.heading.bold },
  filterContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 5,
    borderRadius: 15,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  filterText: { fontSize: 15, fontFamily: fonts.body.semiBold },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  bookingCard: { borderRadius: 20, padding: 20, marginBottom: 15 },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  bookingInfo: { flex: 1 },
  salonName: {
    fontSize: 18,
    fontFamily: fonts.heading.semiBold,
    marginBottom: 4,
  },
  serviceName: { fontSize: 14, fontFamily: fonts.body.regular },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.body.semiBold,
    textTransform: "capitalize",
  },
  bookingDetails: { marginBottom: 15 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  detailText: { fontSize: 14, fontFamily: fonts.body.regular, marginLeft: 10 },
  bookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(128,128,128,0.2)",
  },
  price: { fontSize: 20, fontFamily: fonts.heading.bold },
  cancelButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  cancelButtonText: {
    color: "#F44336",
    fontSize: 14,
    fontFamily: fonts.body.semiBold,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.body.regular,
    marginTop: 20,
    marginBottom: 25,
    textAlign: "center",
  },
  browseButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
  },
  browseButtonText: { fontSize: 16, fontFamily: fonts.body.bold },
});
