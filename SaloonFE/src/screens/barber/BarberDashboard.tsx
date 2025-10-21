import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { bookingAPI, barberAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

export default function BarberDashboard() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === 'dark';
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [allBookings, setAllBookings] = useState([]);
  const [barberInfo, setBarberInfo] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<'unassigned' | 'my' | 'all'>('unassigned');

  const theme = isDark 
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', inputBg: '#0D0D0D' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', inputBg: '#FAFAFA' };

  useEffect(() => {
    fetchBarberInfo();
  }, []);

  useEffect(() => {
    if (barberInfo?.salon) {
      fetchBookings();
    }
  }, [barberInfo]);

  const fetchBarberInfo = async () => {
    try {
      const response = await barberAPI.getAll();
      const myBarber = response.data.find((b: any) => b.user_id === user?.id);
      setBarberInfo(myBarber);
    } catch (error) {
      console.error('Error fetching barber info:', error);
    }
  };

  const fetchBookings = async () => {
    if (!barberInfo?.salon) return;
    
    try {
      const response = await bookingAPI.getBySalon(barberInfo.salon);
      setAllBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToMe = async (booking: any) => {
    Alert.alert(
      'Accept Booking',
      'Do you want to accept this booking? It will be automatically confirmed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept & Confirm',
          onPress: async () => {
            try {
              // Backend will auto-confirm when barber is assigned
              await bookingAPI.assignBarber(booking.id, barberInfo.id);
              setModalVisible(false);
              fetchBookings();
              Alert.alert(
                '✅ Success!', 
                'Booking accepted and confirmed!\nCustomer will be notified.'
              );
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to assign booking');
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (bookingId: number, status: string) => {
    const statusMessages: any = {
      'in_progress': 'Start this service?',
      'completed': 'Mark this service as completed?',
    };

    Alert.alert(
      'Update Status',
      statusMessages[status] || 'Update booking status?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await bookingAPI.update(bookingId, { status });
              setModalVisible(false);
              fetchBookings();
              
              const successMessages: any = {
                'in_progress': '✂️ Service started!',
                'completed': '✅ Service completed!\nGreat job!',
              };
              
              Alert.alert('Success', successMessages[status] || 'Status updated');
            } catch (error) {
              Alert.alert('Error', 'Failed to update booking status');
            }
          },
        },
      ]
    );
  };

  const getFilteredBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (filter === 'unassigned') {
      return allBookings.filter((b: any) => 
        !b.barber && 
        b.status === 'pending' &&
        b.booking_date >= today
      );
    } else if (filter === 'my') {
      return allBookings.filter((b: any) => 
        b.barber === barberInfo?.id &&
        b.status !== 'completed' &&
        b.status !== 'cancelled'
      );
    }
    return allBookings.filter((b: any) => 
      b.status !== 'completed' && 
      b.status !== 'cancelled'
    );
  };

  const filteredBookings = getFilteredBookings();
  const myTodayBookings = allBookings.filter((b: any) => {
    const today = new Date().toISOString().split('T')[0];
    return b.barber === barberInfo?.id && 
           b.booking_date === today &&
           b.status !== 'cancelled';
  });

  const stats = {
    unassigned: allBookings.filter((b: any) => !b.barber && b.status === 'pending').length,
    myBookings: allBookings.filter((b: any) => b.barber === barberInfo?.id && b.status !== 'completed' && b.status !== 'cancelled').length,
    todayEarnings: myTodayBookings
      .filter((b: any) => b.status === 'completed')
      .reduce((sum: number, b: any) => sum + parseFloat(b.service_price || 0), 0),
  };

  const StatCard = ({ title, value, icon, color, onPress }: any) => (
    <TouchableOpacity 
      style={[styles.statCard, { backgroundColor: theme.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: theme.text, opacity: 0.6 }]}>{title}</Text>
    </TouchableOpacity>
  );

  const displayName = user?.first_name || user?.username || 'Barber';

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.text }]}>Hello! 👋</Text>
          <Text style={[styles.userName, { color: theme.text }]}>{displayName}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.notificationButton, { backgroundColor: theme.inputBg }]}
          onPress={() => navigation.navigate('Profile' as never)}
        >
          <Ionicons name="person-circle-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBookings} />}
      >
        {barberInfo?.salon ? (
          <>
            <View style={[styles.salonCard, { backgroundColor: '#4CAF5020' }]}>
              <Ionicons name="storefront" size={24} color="#4CAF50" />
              <View style={styles.salonInfo}>
                <Text style={[styles.salonLabel, { color: '#4CAF50' }]}>Working At</Text>
                <Text style={[styles.salonName, { color: theme.text }]}>{barberInfo.salon_name}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.statsGrid}>
                <StatCard 
                  title="Unassigned" 
                  value={stats.unassigned} 
                  icon="alert-circle" 
                  color="#FF9800"
                  onPress={() => setFilter('unassigned')}
                />
                <StatCard 
                  title="My Bookings" 
                  value={stats.myBookings} 
                  icon="calendar" 
                  color="#2196F3"
                  onPress={() => setFilter('my')}
                />
              </View>
              <View style={styles.statsGrid}>
                <StatCard 
                  title="Today's Earnings" 
                  value={`₹${stats.todayEarnings.toFixed(0)}`} 
                  icon="cash" 
                  color="#4CAF50"
                />
                <StatCard 
                  title="All Bookings" 
                  value={allBookings.length} 
                  icon="list" 
                  color="#9C27B0"
                  onPress={() => setFilter('all')}
                />
              </View>
            </View>

            <View style={[styles.filterContainer, { backgroundColor: theme.card }]}>
              <TouchableOpacity
                style={[styles.filterTab, filter === 'unassigned' && { backgroundColor: '#FF9800' }]}
                onPress={() => setFilter('unassigned')}
              >
                <Text style={[styles.filterText, { color: filter === 'unassigned' ? '#FFF' : theme.text }]}>
                  Unassigned ({stats.unassigned})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterTab, filter === 'my' && { backgroundColor: '#2196F3' }]}
                onPress={() => setFilter('my')}
              >
                <Text style={[styles.filterText, { color: filter === 'my' ? '#FFF' : theme.text }]}>
                  My Jobs ({stats.myBookings})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterTab, filter === 'all' && { backgroundColor: theme.primary }]}
                onPress={() => setFilter('all')}
              >
                <Text style={[styles.filterText, { color: filter === 'all' ? (isDark ? '#000' : '#FFF') : theme.text }]}>
                  All
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              {filteredBookings.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
                  <Ionicons name="calendar-outline" size={50} color={theme.text + '50'} />
                  <Text style={[styles.emptyText, { color: theme.text }]}>
                    {filter === 'unassigned' ? 'No unassigned bookings' : 
                     filter === 'my' ? 'No bookings assigned to you' : 
                     'No bookings available'}
                  </Text>
                </View>
              ) : (
                filteredBookings.map((booking: any) => (
                  <TouchableOpacity
                    key={booking.id}
                    style={[styles.bookingCard, { backgroundColor: theme.card }]}
                    onPress={() => {
                      setSelectedBooking(booking);
                      setModalVisible(true);
                    }}
                  >
                    <View style={styles.bookingHeader}>
                      <View style={styles.bookingMainInfo}>
                        <Text style={[styles.customerName, { color: theme.text }]}>
                          {booking.customer_name}
                        </Text>
                        {!booking.barber && (
                          <View style={styles.unassignedBadge}>
                            <Text style={styles.unassignedText}>New Request</Text>
                          </View>
                        )}
                        {booking.barber === barberInfo?.id && (
                          <View style={styles.assignedToMeBadge}>
                            <Text style={styles.assignedToMeText}>Your Job</Text>
                          </View>
                        )}
                      </View>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(booking.status) + '20' }
                      ]}>
                        <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                          {booking.status}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={[styles.serviceName, { color: theme.text, opacity: 0.7 }]}>
                      {booking.service_name}
                    </Text>
                    
                    <View style={styles.bookingFooter}>
                      <View style={styles.timeInfo}>
                        <Ionicons name="calendar-outline" size={16} color={theme.text} />
                        <Text style={[styles.timeText, { color: theme.text }]}>
                          {booking.booking_date}
                        </Text>
                      </View>
                      <View style={styles.timeInfo}>
                        <Ionicons name="time-outline" size={16} color={theme.text} />
                        <Text style={[styles.timeText, { color: theme.text }]}>
                          {booking.booking_time}
                        </Text>
                      </View>
                      <Text style={[styles.price, { color: '#4CAF50' }]}>
                        ₹{booking.service_price}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.joinSalonCard, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate('JoinSalonRequest' as never)}
          >
            <Ionicons name="add-circle" size={32} color={theme.primary} />
            <View style={styles.joinSalonInfo}>
              <Text style={[styles.joinSalonTitle, { color: theme.text }]}>Join a Salon</Text>
              <Text style={[styles.joinSalonSubtitle, { color: theme.text, opacity: 0.6 }]}>
                Send join requests to salons to start working
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.text} />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Booking Detail Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Booking Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            {selectedBooking && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalBody}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.text }]}>Customer</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {selectedBooking.customer_name}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.text }]}>Service</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {selectedBooking.service_name}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.text }]}>Date & Time</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {selectedBooking.booking_date} at {selectedBooking.booking_time}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.text }]}>Price</Text>
                    <Text style={[styles.detailValue, { color: '#4CAF50' }]}>
                      ₹{selectedBooking.service_price}
                    </Text>
                  </View>

                  {selectedBooking.notes && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: theme.text }]}>Notes</Text>
                      <Text style={[styles.detailValue, { color: theme.text }]}>
                        {selectedBooking.notes}
                      </Text>
                    </View>
                  )}

                  {/* Accept Booking Button (for unassigned) */}
                  {!selectedBooking.barber && selectedBooking.status === 'pending' && (
                    <TouchableOpacity
                      style={[styles.acceptButton, { backgroundColor: '#4CAF50' }]}
                      onPress={() => handleAssignToMe(selectedBooking)}
                    >
                      <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                      <Text style={styles.acceptButtonText}>Accept & Confirm</Text>
                    </TouchableOpacity>
                  )}

                  {/* Status Update Actions (for assigned bookings) */}
                  {selectedBooking.barber === barberInfo?.id && (
                    <View style={styles.actionsSection}>
                      <Text style={[styles.actionsTitle, { color: theme.text }]}>
                        Update Status
                      </Text>
                      
                      {selectedBooking.status === 'confirmed' && (
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
                          onPress={() => handleUpdateStatus(selectedBooking.id, 'in_progress')}
                        >
                          <Ionicons name="cut" size={24} color="#FFF" />
                          <Text style={styles.actionButtonText}>Start Service</Text>
                        </TouchableOpacity>
                      )}

                      {selectedBooking.status === 'in_progress' && (
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                          onPress={() => handleUpdateStatus(selectedBooking.id, 'completed')}
                        >
                          <Ionicons name="checkmark-done" size={24} color="#FFF" />
                          <Text style={styles.actionButtonText}>Complete Service</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

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

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  greeting: { fontSize: 16, opacity: 0.7 },
  userName: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  notificationButton: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 60, right: 20 },
  salonCard: { marginHorizontal: 20, marginBottom: 20, padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  salonInfo: { marginLeft: 15, flex: 1 },
  salonLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  salonName: { fontSize: 18, fontWeight: 'bold' },
  joinSalonCard: { marginHorizontal: 20, marginTop: 100, padding: 30, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  joinSalonInfo: { marginLeft: 15, flex: 1 },
  joinSalonTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  joinSalonSubtitle: { fontSize: 14 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statCard: { flex: 1, marginHorizontal: 5, padding: 20, borderRadius: 20, alignItems: 'center' },
  statIconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statTitle: { fontSize: 12, textAlign: 'center' },
  filterContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, padding: 5, borderRadius: 15 },
  filterTab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginHorizontal: 3 },
  filterText: { fontSize: 13, fontWeight: '600' },
  bookingCard: { padding: 18, borderRadius: 18, marginBottom: 12 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  bookingMainInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  customerName: { fontSize: 18, fontWeight: 'bold', marginRight: 8 },
  unassignedBadge: { backgroundColor: '#FF980020', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  unassignedText: { color: '#FF9800', fontSize: 11, fontWeight: '600' },
  assignedToMeBadge: { backgroundColor: '#2196F320', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  assignedToMeText: { color: '#2196F3', fontSize: 11, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  serviceName: { fontSize: 15, marginBottom: 10 },
  bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeInfo: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 13, marginLeft: 5 },
  price: { fontSize: 17, fontWeight: 'bold' },
  emptyCard: { padding: 60, borderRadius: 20, alignItems: 'center' },
  emptyText: { fontSize: 16, marginTop: 15, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold' },
  modalBody: { paddingBottom: 20 },
  detailRow: { marginBottom: 18 },
  detailLabel: { fontSize: 14, opacity: 0.6, marginBottom: 6 },
  detailValue: { fontSize: 16, fontWeight: '600' },
  acceptButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 15, marginTop: 20 },
  acceptButtonText: { color: '#FFF', fontSize: 17, fontWeight: 'bold', marginLeft: 10 },
  actionsSection: { marginTop: 25 },
  actionsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 15, marginBottom: 12 },
  actionButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
});
