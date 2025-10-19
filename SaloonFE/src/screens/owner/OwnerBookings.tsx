import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { bookingAPI } from '../../services/api';

export default function OwnerBookings() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === 'dark';
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const theme = isDark 
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000' };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      await bookingAPI.update(bookingId, { status });
      setModalVisible(false);
      fetchBookings();
      Alert.alert('Success', `Booking ${status} successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: '#FF9800',
      confirmed: '#2196F3',
      in_progress: '#9C27B0',
      completed: '#4CAF50',
      cancelled: '#F44336',
    };
    return colors[status] || '#808080';
  };

  const statusOptions = [
    { value: 'confirmed', label: 'Confirm', icon: 'checkmark-circle', color: '#2196F3' },
    { value: 'in_progress', label: 'In Progress', icon: 'time', color: '#9C27B0' },
    { value: 'completed', label: 'Complete', icon: 'checkmark-done', color: '#4CAF50' },
    { value: 'cancelled', label: 'Cancel', icon: 'close-circle', color: '#F44336' },
  ];

  const renderBooking = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.bookingCard, { backgroundColor: theme.card }]}
      onPress={() => {
        setSelectedBooking(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.bookingHeader}>
        <View>
          <Text style={[styles.bookingId, { color: theme.text }]}>#{item.id}</Text>
          <Text style={[styles.customerName, { color: theme.text }]}>{item.customer_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={[styles.serviceName, { color: theme.text, opacity: 0.6 }]}>
        {item.service_name}
      </Text>
      <Text style={[styles.salonName, { color: theme.text, opacity: 0.8 }]}>
        {item.salon_name}
      </Text>

      <View style={styles.bookingFooter}>
        <View style={styles.dateTime}>
          <Ionicons name="calendar-outline" size={16} color={theme.text} />
          <Text style={[styles.dateText, { color: theme.text }]}>{item.booking_date}</Text>
        </View>
        <View style={styles.dateTime}>
          <Ionicons name="time-outline" size={16} color={theme.text} />
          <Text style={[styles.dateText, { color: theme.text }]}>{item.booking_time}</Text>
        </View>
      </View>

      {item.notes && (
        <Text style={[styles.notes, { color: theme.text, opacity: 0.5 }]}>
          Note: {item.notes}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>All Bookings</Text>
        <View style={styles.statsContainer}>
          <Text style={[styles.statsText, { color: theme.text }]}>
            {bookings.filter((b: any) => b.status === 'pending').length} Pending
          </Text>
        </View>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBookings} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color={theme.text + '50'} />
            <Text style={[styles.emptyText, { color: theme.text }]}>No bookings yet</Text>
          </View>
        }
      />

      {/* Status Update Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Update Booking Status</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            {selectedBooking && (
              <View style={styles.modalBody}>
                <View style={styles.bookingInfo}>
                  <Text style={[styles.infoLabel, { color: theme.text, opacity: 0.6 }]}>
                    Customer
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>
                    {selectedBooking.customer_name}
                  </Text>
                </View>

                <View style={styles.bookingInfo}>
                  <Text style={[styles.infoLabel, { color: theme.text, opacity: 0.6 }]}>
                    Service
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>
                    {selectedBooking.service_name}
                  </Text>
                </View>

                <View style={styles.bookingInfo}>
                  <Text style={[styles.infoLabel, { color: theme.text, opacity: 0.6 }]}>
                    Current Status
                  </Text>
                  <View style={[styles.currentStatus, { backgroundColor: getStatusColor(selectedBooking.status) + '20' }]}>
                    <Text style={[styles.currentStatusText, { color: getStatusColor(selectedBooking.status) }]}>
                      {selectedBooking.status}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>Change Status To:</Text>

                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.statusOption, { backgroundColor: option.color + '20' }]}
                    onPress={() => updateBookingStatus(selectedBooking.id, option.value)}
                  >
                    <Ionicons name={option.icon as any} size={24} color={option.color} />
                    <Text style={[styles.statusOptionText, { color: option.color }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  statsContainer: { flexDirection: 'row' },
  statsText: { fontSize: 14, opacity: 0.7 },
  list: { padding: 20 },
  bookingCard: { padding: 20, borderRadius: 20, marginBottom: 15 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  bookingId: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  customerName: { fontSize: 18, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  serviceName: { fontSize: 14, marginBottom: 4 },
  salonName: { fontSize: 14, marginBottom: 12 },
  bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dateTime: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 14, marginLeft: 6 },
  notes: { fontSize: 12, fontStyle: 'italic', marginTop: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold' },
  modalBody: {},
  bookingInfo: { marginBottom: 15 },
  infoLabel: { fontSize: 14, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '600' },
  currentStatus: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start' },
  currentStatusText: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 15 },
  statusOption: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, marginBottom: 10 },
  statusOptionText: { fontSize: 16, fontWeight: '600', marginLeft: 12 },
});
