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
  AsyncStorage,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { bookingAPI, barberAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { 
  notifyBookingConfirmed, 
  notifyServiceStarted, 
  notifyServiceCompleted 
} from '../../utils/notificationHelpers';

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
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', inputBg: '#0D0D0D', border: '#333333' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', inputBg: '#FAFAFA', border: '#E0E0E0' };

  useEffect(() => {
    fetchBarberInfo();
  }, []);

  useEffect(() => {
    if (barberInfo?.salon) {
      fetchBookings();
      const interval = setInterval(fetchBookings, 30000);
      return () => clearInterval(interval);
    }
  }, [barberInfo]);

  const fetchBarberInfo = async () => {
    try {
      console.log('🔍 Fetching barber info for user ID:', user?.id);
      const response = await barberAPI.getAll();
      console.log('📡 API Response:', response.data);
      
      let myBarber = response.data.find((b: any) => {
        console.log('🔍 Checking barber:', b.user_id, 'vs', user?.id, '| also:', b.user?.id);
        return b.user?.id === user?.id || b.user_id === user?.id;
      });

      if (!myBarber) {
        console.log('⚠️ Barber not found, checking alternative structure...');
        myBarber = response.data.find((b: any) => b.id === user?.barber_id);
      }

      console.log('✅ Found barber:', myBarber);
      console.log('✅ Barber Salon ID:', myBarber?.salon);
      console.log('✅ Barber Salon Name:', myBarber?.salon_name);
      
      setBarberInfo(myBarber);
    } catch (error: any) {
      console.error('❌ Error fetching barber info:', error);
      Alert.alert('Error', 'Failed to load barber information');
    }
  };

  const fetchBookings = async () => {
    if (!barberInfo?.salon) {
      console.log('⚠️ No salon assigned yet');
      return;
    }
    
    try {
      console.log('📡 Fetching bookings for salon:', barberInfo.salon);
      const response = await bookingAPI.getBySalon(barberInfo.salon);
      console.log('✅ Fetched bookings:', response.data.length);
      setAllBookings(response.data);
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToMe = async (booking: any) => {
    Alert.alert(
      'Accept Booking',
      'Do you want to accept this booking? Customer will be notified.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept & Confirm',
          onPress: async () => {
            try {
              console.log('📤 Assigning booking...');
              console.log('  Booking ID:', booking.id);
              console.log('  Barber ID:', barberInfo?.id);

              const barberId = barberInfo?.id;

              if (!barberId) {
                Alert.alert('Error', 'Barber information not found. Please refresh.');
                return;
              }

              await bookingAPI.assignBarber(booking.id, barberId);
              
              console.log('✅ Booking assigned successfully');
              
              await notifyBookingConfirmed(
                booking.salon_name,
                booking.service_name,
                booking.booking_date,
                booking.booking_time
              );
              
              setModalVisible(false);
              fetchBookings();
              Alert.alert(
                '✅ Success!', 
                'Booking accepted and confirmed!\nCustomer has been notified.'
              );
            } catch (error: any) {
              console.error('❌ Assignment error:', error.response?.data || error.message);
              Alert.alert('Error', error.response?.data?.error || 'Failed to assign booking');
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (bookingId: number, status: string, booking: any) => {
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
              console.log('📤 Updating booking status...');
              console.log('  Booking ID:', bookingId);
              console.log('  New Status:', status);

              await bookingAPI.update(bookingId, { status });
              
              if (status === 'in_progress') {
                await notifyServiceStarted(
                  booking.salon_name,
                  booking.service_name
                );
              } else if (status === 'completed') {
                await notifyServiceCompleted(
                  booking.salon_name,
                  booking.service_name
                );
              }
              
              setModalVisible(false);
              fetchBookings();
              
              const successMessages: any = {
                'in_progress': '✂️ Service started! Customer notified.',
                'completed': '✅ Service completed! Customer notified.',
              };
              
              Alert.alert('Success', successMessages[status] || 'Status updated');
            } catch (error) {
              console.error('❌ Status update error:', error);
              Alert.alert('Error', 'Failed to update booking status');
            }
          },
        },
      ]
    );
  };

  // ✅ NEW: Handle booking cancellation
  const handleCancelBooking = async (booking: any) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('📤 Cancelling booking ID:', booking.id);
              
              // Use the cancel endpoint
              const response = await bookingAPI.cancel(booking.id);
              
              console.log('✅ Booking cancelled:', response.data);
              setModalVisible(false);
              fetchBookings();
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (error: any) {
              console.error('❌ Cancel error:', error);
              Alert.alert('Error', error.response?.data?.error || 'Failed to cancel booking');
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
      style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
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
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.text }]}>Hello! 👋</Text>
          <Text style={[styles.userName, { color: theme.text }]}>{displayName}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.notificationButton, { backgroundColor: theme.inputBg, borderColor: theme.border, borderWidth: 1 }]}
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
            <View style={[styles.salonCard, { backgroundColor: '#4CAF5020', borderColor: '#4CAF50', borderWidth: 1 }]}>
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

            {stats.unassigned > 0 && (
              <View style={[styles.alertBanner, { backgroundColor: '#FF980020', borderColor: '#FF9800', borderWidth: 1 }]}>
                <Ionicons name="notifications" size={20} color="#FF9800" />
                <Text style={[styles.alertText, { color: '#FF9800' }]}>
                  {stats.unassigned} new booking{stats.unassigned > 1 ? 's' : ''} waiting for assignment!
                </Text>
              </View>
            )}

            <View style={[styles.filterContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
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
                <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
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
                    style={[styles.bookingCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
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
                            <Ionicons name="alert-circle" size={12} color="#FF9800" />
                            <Text style={styles.unassignedText}> New</Text>
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
                        { backgroundColor: getStatusColor(booking.status) + '20', borderColor: getStatusColor(booking.status), borderWidth: 1 }
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
            style={[styles.joinSalonCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
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

      {/* ✅ Booking Detail Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
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

                  {/* Accept Booking Button */}
                  {(selectedBooking.barber === null || selectedBooking.barber === undefined || !selectedBooking.barber) && selectedBooking.status === 'pending' && (
                    <TouchableOpacity
                      style={[styles.acceptButton, { backgroundColor: '#4CAF50' }]}
                      onPress={() => handleAssignToMe(selectedBooking)}
                    >
                      <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                      <Text style={styles.acceptButtonText}>Accept & Notify Customer</Text>
                    </TouchableOpacity>
                  )}

                  {/* Status Update Actions */}
                  {selectedBooking.barber === barberInfo?.id && (
                    <View style={styles.actionsSection}>
                      <Text style={[styles.actionsTitle, { color: theme.text }]}>
                        Update Status
                      </Text>
                      
                      {selectedBooking.status === 'confirmed' && (
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
                          onPress={() => handleUpdateStatus(selectedBooking.id, 'in_progress', selectedBooking)}
                        >
                          <Ionicons name="cut" size={24} color="#FFF" />
                          <Text style={styles.actionButtonText}>Start Service</Text>
                        </TouchableOpacity>
                      )}

                      {selectedBooking.status === 'in_progress' && (
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                          onPress={() => handleUpdateStatus(selectedBooking.id, 'completed', selectedBooking)}
                        >
                          <Ionicons name="checkmark-done" size={24} color="#FFF" />
                          <Text style={styles.actionButtonText}>Complete Service</Text>
                        </TouchableOpacity>
                      )}

                      {selectedBooking.status !== 'completed' && (
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                          onPress={() => handleCancelBooking(selectedBooking)}
                        >
                          <Ionicons name="close-circle" size={24} color="#FFF" />
                          <Text style={styles.actionButtonText}>Cancel Booking</Text>
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
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 16, opacity: 0.7 },
  userName: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  notificationButton: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  salonCard: { marginHorizontal: 20, marginBottom: 20, marginTop: 15, padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
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
  alertBanner: { marginHorizontal: 20, padding: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  alertText: { fontSize: 14, fontWeight: '600', marginLeft: 10, flex: 1 },
  filterContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, padding: 5, borderRadius: 15 },
  filterTab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginHorizontal: 3 },
  filterText: { fontSize: 13, fontWeight: '600' },
  bookingCard: { padding: 18, borderRadius: 18, marginBottom: 12 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  bookingMainInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  customerName: { fontSize: 18, fontWeight: 'bold', marginRight: 8 },
  unassignedBadge: { backgroundColor: '#FF980020', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
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
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
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
