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
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [barberInfo, setBarberInfo] = useState<any>(null);
  const [stats, setStats] = useState({
    todayBookings: 0,
    completedToday: 0,
    totalEarnings: 0,
  });

  const theme = isDark 
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', inputBg: '#0D0D0D' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', inputBg: '#FAFAFA' };

  useEffect(() => {
    fetchDashboardData();
    fetchBarberInfo();
  }, []);

  const fetchBarberInfo = async () => {
    try {
      const response = await barberAPI.getAll();
      const myBarber = response.data.find((b: any) => b.user_id === user?.id);
      setBarberInfo(myBarber);
    } catch (error) {
      console.error('Error fetching barber info:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await bookingAPI.getAll();
      const bookings = response.data;
      const today = new Date().toISOString().split('T')[0];
      
      const todaysBookings = bookings.filter((b: any) => b.booking_date === today);
      const completed = todaysBookings.filter((b: any) => b.status === 'completed');
      
      setTodayAppointments(todaysBookings);
      setStats({
        todayBookings: todaysBookings.length,
        completedToday: completed.length,
        totalEarnings: completed.reduce((sum: number, b: any) => sum + parseFloat(b.service_price || 0), 0),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: number, status: string) => {
    try {
      await bookingAPI.update(bookingId, { status });
      fetchDashboardData();
      Alert.alert('Success', `Booking ${status}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.statCard, { backgroundColor: theme.card }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: theme.text, opacity: 0.6 }]}>{title}</Text>
    </View>
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
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardData} />}
      >
        {/* Salon Status */}
        {barberInfo?.salon ? (
          <View style={[styles.salonCard, { backgroundColor: '#4CAF5020' }]}>
            <Ionicons name="storefront" size={24} color="#4CAF50" />
            <View style={styles.salonInfo}>
              <Text style={[styles.salonLabel, { color: '#4CAF50' }]}>Currently Working At</Text>
              <Text style={[styles.salonName, { color: theme.text }]}>{barberInfo.salon_name}</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.joinSalonCard, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate('JoinSalonRequest' as never)}
          >
            <Ionicons name="add-circle" size={32} color={theme.primary} />
            <View style={styles.joinSalonInfo}>
              <Text style={[styles.joinSalonTitle, { color: theme.text }]}>Join a Salon</Text>
              <Text style={[styles.joinSalonSubtitle, { color: theme.text, opacity: 0.6 }]}>
                Send join requests to salons
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.text} />
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard title="Appointments" value={stats.todayBookings} icon="calendar" color="#2196F3" />
            <StatCard title="Completed" value={stats.completedToday} icon="checkmark-circle" color="#4CAF50" />
          </View>
          <View style={styles.statsGrid}>
            <StatCard 
              title="Today's Earnings" 
              value={`₹${stats.totalEarnings.toFixed(0)}`} 
              icon="cash" 
              color="#9C27B0" 
            />
            <StatCard 
              title="Pending" 
              value={stats.todayBookings - stats.completedToday} 
              icon="time" 
              color="#FF9800" 
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Schedule</Text>
          {todayAppointments.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
              <Ionicons name="calendar-outline" size={50} color={theme.text + '50'} />
              <Text style={[styles.emptyText, { color: theme.text }]}>No appointments today</Text>
            </View>
          ) : (
            todayAppointments.map((appointment: any, index) => (
              <View key={index} style={[styles.appointmentCard, { backgroundColor: theme.card }]}>
                <View style={styles.appointmentHeader}>
                  <Text style={[styles.customerName, { color: theme.text }]}>
                    {appointment.customer_name}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(appointment.status) + '20' }
                  ]}>
                    <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                      {appointment.status}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.serviceName, { color: theme.text, opacity: 0.7 }]}>
                  {appointment.service_name}
                </Text>
                <View style={styles.appointmentFooter}>
                  <View style={styles.timeInfo}>
                    <Ionicons name="time-outline" size={16} color={theme.text} />
                    <Text style={[styles.timeText, { color: theme.text }]}>
                      {appointment.booking_time}
                    </Text>
                  </View>
                  <Text style={[styles.price, { color: '#4CAF50' }]}>
                    ₹{appointment.service_price}
                  </Text>
                </View>
                
                {/* Quick Actions */}
                {appointment.status === 'confirmed' && (
                  <View style={styles.quickActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
                      onPress={() => handleUpdateBookingStatus(appointment.id, 'in_progress')}
                    >
                      <Text style={styles.actionButtonText}>Start</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {appointment.status === 'in_progress' && (
                  <View style={styles.quickActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                      onPress={() => handleUpdateBookingStatus(appointment.id, 'completed')}
                    >
                      <Text style={styles.actionButtonText}>Complete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  joinSalonCard: { marginHorizontal: 20, marginBottom: 20, padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  joinSalonInfo: { marginLeft: 15, flex: 1 },
  joinSalonTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  joinSalonSubtitle: { fontSize: 14 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statCard: { flex: 1, marginHorizontal: 5, padding: 20, borderRadius: 20, alignItems: 'center' },
  statIconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statTitle: { fontSize: 12, textAlign: 'center' },
  emptyCard: { padding: 40, borderRadius: 20, alignItems: 'center' },
  emptyText: { fontSize: 16, marginTop: 15 },
  appointmentCard: { padding: 15, borderRadius: 15, marginBottom: 12 },
  appointmentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  customerName: { fontSize: 18, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  serviceName: { fontSize: 14, marginBottom: 10 },
  appointmentFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  timeInfo: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 14, marginLeft: 6 },
  price: { fontSize: 16, fontWeight: 'bold' },
  quickActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  actionButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  actionButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});
