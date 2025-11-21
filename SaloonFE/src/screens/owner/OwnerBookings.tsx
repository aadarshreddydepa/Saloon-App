import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { bookingAPI } from "../../services/api";
import DateTimePicker from "@react-native-community/datetimepicker";
import { fonts } from "../../config/fonts";

export default function OwnerBookings() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unassigned" | "dateRange">(
    "all"
  );

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [dateRangeActive, setDateRangeActive] = useState(false);

  const theme = isDark
    ? {
        bg: "#000000",
        card: "#1A1A1A",
        text: "#C0C0C0",
        primary: "#C0C0C0",
        accent: "#2196F3",
        border: "#333",
      }
    : {
        bg: "#F5F5F5",
        card: "#FFFFFF",
        text: "#000000",
        primary: "#000000",
        accent: "#2196F3",
        border: "#E0E0E0",
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

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (date: Date) => {
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return { month, day };
  };

  const getFilteredBookings = () => {
    if (filter === "unassigned") {
      return bookings.filter((b: any) => !b.barber && b.status !== "cancelled");
    } else if (filter === "dateRange" && dateRangeActive) {
      const from = formatDate(fromDate);
      const to = formatDate(toDate);
      return bookings.filter((b: any) => {
        const bookingDate = b.booking_date;
        return bookingDate >= from && bookingDate <= to;
      });
    }
    return bookings;
  };

  const filteredBookings = getFilteredBookings();

  const stats = {
    total: bookings.length,
    unassigned: bookings.filter((b: any) => !b.barber && b.status === "pending")
      .length,
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

  const getStatusIcon = (status: string) => {
    const icons: any = {
      pending: "time-outline",
      confirmed: "checkmark-circle",
      in_progress: "sync-circle",
      completed: "checkmark-done-circle",
      cancelled: "close-circle",
    };
    return icons[status] || "help-circle";
  };

  const handleFromDateChange = (event: any, selectedDate?: Date) => {
    setShowFromPicker(false);
    if (selectedDate) {
      setFromDate(selectedDate);
      if (selectedDate > toDate) {
        setToDate(selectedDate);
      }
    }
  };

  const handleToDateChange = (event: any, selectedDate?: Date) => {
    setShowToPicker(false);
    if (selectedDate) {
      setToDate(selectedDate);
      if (selectedDate < fromDate) {
        setFromDate(selectedDate);
      }
    }
  };

  const applyDateRange = () => {
    setDateRangeActive(true);
    setFilter("dateRange");
  };

  const clearDateRange = () => {
    setDateRangeActive(false);
    setFilter("all");
    setFromDate(new Date());
    setToDate(new Date());
  };

  const renderBooking = ({ item }: any) => {
    const fromDateDisplay = formatDisplayDate(new Date(item.booking_date));

    return (
      <View
        style={[
          styles.bookingCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardContent}>
          {/* Left: Date Badge */}
          <View
            style={[
              styles.dateBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.dateMonth}>{fromDateDisplay.month}</Text>
            <Text style={styles.dateDay}>{fromDateDisplay.day}</Text>
          </View>

          {/* Middle: Booking Details */}
          <View style={styles.bookingDetails}>
            <View style={styles.nameRow}>
              <Text
                style={[styles.customerName, { color: theme.text }]}
                numberOfLines={1}
              >
                {item.customer_name}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + "20" },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(item.status)}
                  size={12}
                  color={getStatusColor(item.status)}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status.replace("_", " ")}
                </Text>
              </View>
            </View>

            <Text
              style={[styles.salonName, { color: theme.text }]}
              numberOfLines={1}
            >
              {item.salon_name}
            </Text>

            <View style={styles.serviceRow}>
              <Ionicons name="cut" size={14} color={theme.accent} />
              <Text
                style={[styles.serviceName, { color: theme.text }]}
                numberOfLines={1}
              >
                {item.service_name}
              </Text>
              <Text style={[styles.price, { color: theme.accent }]}>
                ₹{item.service_price}
              </Text>
            </View>

            <View style={styles.timeBarberRow}>
              <View style={styles.timeInfo}>
                <Ionicons name="time" size={14} color={theme.text + "80"} />
                <Text style={[styles.timeText, { color: theme.text }]}>
                  {item.booking_time}
                </Text>
              </View>

              {item.barber_name ? (
                <View style={styles.barberBadge}>
                  <Ionicons name="person" size={12} color="#4CAF50" />
                  <Text style={styles.barberText} numberOfLines={1}>
                    {item.barber_name}
                  </Text>
                </View>
              ) : (
                <View
                  style={[styles.barberBadge, { backgroundColor: "#FF980015" }]}
                >
                  <Ionicons name="alert-circle" size={12} color="#FF9800" />
                  <Text style={[styles.barberText, { color: "#FF9800" }]}>
                    Unassigned
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Compact Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Bookings
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.text }]}>
            Track salon bookings
          </Text>
        </View>
      </View>

      {/* Compact Date Range Filter */}
      <View style={[styles.filterBar, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          style={[styles.compactDateButton, { backgroundColor: theme.bg }]}
          onPress={() => setShowFromPicker(true)}
        >
          <Text style={[styles.compactLabel, { color: theme.text }]}>From</Text>
          <Text style={[styles.compactDate, { color: theme.accent }]}>
            {formatDisplayDate(fromDate).month}{" "}
            {formatDisplayDate(fromDate).day}
          </Text>
        </TouchableOpacity>

        <Ionicons name="arrow-forward" size={20} color={theme.text + "50"} />

        <TouchableOpacity
          style={[styles.compactDateButton, { backgroundColor: theme.bg }]}
          onPress={() => setShowToPicker(true)}
        >
          <Text style={[styles.compactLabel, { color: theme.text }]}>To</Text>
          <Text style={[styles.compactDate, { color: theme.accent }]}>
            {formatDisplayDate(toDate).month} {formatDisplayDate(toDate).day}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.accent }]}
          onPress={applyDateRange}
        >
          <Ionicons name="funnel" size={18} color="#FFF" />
        </TouchableOpacity>

        {dateRangeActive && (
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: "#FF5722" }]}
            onPress={clearDateRange}
          >
            <Ionicons name="close" size={18} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* ✅ UPDATED: Inline Compact Stats */}
      <View style={[styles.inlineStats, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          style={[
            styles.inlineStat,
            filter === "all" &&
              !dateRangeActive && { backgroundColor: theme.accent + "15" },
          ]}
          onPress={() => {
            setFilter("all");
            setDateRangeActive(false);
          }}
        >
          <Ionicons name="albums" size={18} color="#2196F3" />
          <Text style={[styles.inlineStatValue, { color: theme.text }]}>
            {stats.total}
          </Text>
          <Text style={[styles.inlineStatLabel, { color: theme.text }]}>
            Total
          </Text>
        </TouchableOpacity>

        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />

        <TouchableOpacity
          style={[
            styles.inlineStat,
            filter === "unassigned" &&
              !dateRangeActive && { backgroundColor: "#FF980015" },
          ]}
          onPress={() => {
            setFilter("unassigned");
            setDateRangeActive(false);
          }}
        >
          <Ionicons name="alert-circle" size={18} color="#FF9800" />
          <Text style={[styles.inlineStatValue, { color: theme.text }]}>
            {stats.unassigned}
          </Text>
          <Text style={[styles.inlineStatLabel, { color: theme.text }]}>
            Unassigned
          </Text>
        </TouchableOpacity>

        {dateRangeActive && (
          <>
            <View
              style={[styles.statDivider, { backgroundColor: theme.border }]}
            />
            <View
              style={[
                styles.inlineStat,
                { backgroundColor: theme.accent + "15" },
              ]}
            >
              <Ionicons name="funnel" size={18} color={theme.accent} />
              <Text style={[styles.inlineStatValue, { color: theme.text }]}>
                {filteredBookings.length}
              </Text>
              <Text style={[styles.inlineStatLabel, { color: theme.text }]}>
                Filtered
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Bookings List */}
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
              size={70}
              color={theme.text + "30"}
            />
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No bookings found
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.text }]}>
              {dateRangeActive
                ? "Try adjusting date range"
                : "Bookings will appear here"}
            </Text>
          </View>
        }
      />

      {/* Date Pickers */}
      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display="default"
          onChange={handleFromDateChange}
          maximumDate={new Date()}
        />
      )}
      {showToPicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display="default"
          onChange={handleToDateChange}
          maximumDate={new Date()}
          minimumDate={fromDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Compact Header
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: fonts.heading.bold,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    opacity: 0.6,
    fontFamily: fonts.body.regular,
  },

  // Compact Filter Bar
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 10,
    borderRadius: 15,
    gap: 8,
  },
  compactDateButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  compactLabel: {
    fontSize: 10,
    opacity: 0.6,
    marginBottom: 2,
    fontFamily: fonts.body.regular,
  },
  compactDate: {
    fontSize: 13,
    fontFamily: fonts.heading.bold,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  // ✅ NEW: Inline Compact Stats
  inlineStats: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
  },
  inlineStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 6,
  },
  inlineStatValue: {
    fontSize: 16,
    fontFamily: fonts.heading.bold,
  },
  inlineStatLabel: {
    fontSize: 11,
    opacity: 0.7,
    fontFamily: fonts.body.regular,
  },
  statDivider: {
    width: 1,
    height: 24,
    opacity: 0.3,
  },

  // Bookings List
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  bookingCard: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
  },

  // Date Badge
  dateBadge: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dateMonth: {
    fontSize: 10,
    color: "#FFF",
    fontFamily: fonts.body.semiBold,
    textTransform: "uppercase",
  },
  dateDay: {
    fontSize: 18,
    color: "#FFF",
    fontFamily: fonts.heading.bold,
  },

  // Booking Details
  bookingDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontFamily: fonts.heading.semiBold,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fonts.body.semiBold,
    textTransform: "capitalize",
  },
  salonName: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 6,
    fontFamily: fonts.body.regular,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  serviceName: {
    fontSize: 13,
    fontFamily: fonts.body.medium,
    flex: 1,
  },
  price: {
    fontSize: 14,
    fontFamily: fonts.heading.bold,
  },
  timeBarberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: fonts.body.medium,
  },
  barberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF5015",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    maxWidth: "50%",
  },
  barberText: {
    fontSize: 11,
    color: "#4CAF50",
    fontFamily: fonts.body.semiBold,
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.heading.bold,
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: "center",
    fontFamily: fonts.body.regular,
  },
});
