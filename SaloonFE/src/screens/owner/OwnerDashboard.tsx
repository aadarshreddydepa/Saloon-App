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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { salonAPI, bookingAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

export default function OwnerDashboard() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === 'dark';
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [stats, setStats] = useState({
    totalSalons: 0,
    todayValidBookings: 0,
    todayCompletedBookings: 0,
    todayBookings: 0,
    todayRevenue: 0,
  });

  const theme = isDark 
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', inputBg: '#0D0D0D' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', inputBg: '#FAFAFA' };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [salonsRes, bookingsRes] = await Promise.all([
        salonAPI.getAll(),
        bookingAPI.getAll(),
      ]);

      const salons = salonsRes.data;
      const allBookings = bookingsRes.data;
      const today = new Date().toISOString().split('T')[0];

      // ✅ Filter TODAY's bookings only
      const todayBookings = allBookings.filter((b: any) => b.booking_date === today);

      // ✅ TODAY's VALID bookings (confirmed, in_progress, completed with barber)
      const todayValidBookings = todayBookings.filter((b: any) => 
        (b.status === 'confirmed' || b.status === 'in_progress' || b.status === 'completed') && 
        b.barber !== null
      );

      // ✅ TODAY's COMPLETED bookings only
      const todayCompletedBookings = todayBookings.filter((b: any) => 
        b.status === 'completed' && b.barber !== null
      );

      // ✅ Calculate revenue ONLY from TODAY's completed bookings
      const todayRevenue = todayCompletedBookings.reduce(
        (sum: number, b: any) => sum + (parseFloat(b.service_price) || 0),
        0
      );

      // ✅ Sort bookings by creation date (most recent first)
      const sortedBookings = [...allBookings].sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setRecentBookings(sortedBookings.slice(0, 3));

      setStats({
        totalSalons: salons.length || 0,
        todayValidBookings: todayValidBookings.length || 0,
        todayCompletedBookings: todayCompletedBookings.length || 0,
        todayBookings: todayBookings.length || 0,
        todayRevenue: todayRevenue,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const quickActions = [
    { id: 1, title: 'Add Salon', icon: 'add-circle', color: '#4CAF50', screen: 'AddSalon' },
    { id: 2, title: 'Manage Salons', icon: 'storefront', color: '#2196F3', screen: 'My Salons' },
    { id: 3, title: 'Add Services', icon: 'list', color: '#FF9800', screen: 'AddService' },
    { id: 4, title: 'View Bookings', icon: 'calendar', color: '#9C27B0', screen: 'Bookings' },
  ];

  const handleQuickAction = (screen: string) => {
    if (screen === 'My Salons' || screen === 'Bookings') {
      navigation.navigate(screen as never);
    } else {
      navigation.navigate(screen as never);
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

  const displayName = user?.first_name || user?.username || 'Owner';

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.text }]}>Welcome Back! 👋</Text>
          <Text style={[styles.userName, { color: theme.text }]}>{displayName}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.notificationButton, { backgroundColor: theme.inputBg }]}
          onPress={() => navigation.navigate('Profile' as never)}
        >
          <Ionicons name="settings-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardData} />}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard title="Total Salons" value={stats.totalSalons} icon="storefront" color="#4CAF50" />
            <StatCard title="Valid Bookings" value={stats.todayValidBookings} icon="calendar" color="#2196F3" />
          </View>
          <View style={styles.statsGrid}>
            <StatCard title="Completed Today" value={stats.todayCompletedBookings} icon="checkmark-done" color="#FF9800" />
            <StatCard title="Today's Revenue" value={`₹${stats.todayRevenue.toFixed(0)}`} icon="cash" color="#9C27B0" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { backgroundColor: theme.card }]}
                onPress={() => handleQuickAction(action.screen)}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={32} color={action.color} />
                </View>
                <Text style={[styles.actionTitle, { color: theme.text }]}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Bookings' as never)}>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentBookings.length > 0 ? (
            recentBookings.map((booking: any) => (
              <View key={booking.id} style={[styles.recentBookingCard, { backgroundColor: theme.card }]}>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(booking.status) }]} />
                <View style={styles.bookingContent}>
                  <View style={styles.bookingHeader}>
                    <Text style={[styles.bookingCustomer, { color: theme.text }]} numberOfLines={1}>
                      {booking.customer_name}
                    </Text>
                    <Text style={[styles.bookingTime, { color: theme.text, opacity: 0.5 }]}>
                      {formatTimeAgo(booking.created_at)}
                    </Text>
                  </View>
                  <Text style={[styles.bookingService, { color: theme.text, opacity: 0.7 }]} numberOfLines={1}>
                    {booking.service_name} • {booking.salon_name}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={[styles.emptyActivity, { backgroundColor: theme.card }]}>
              <Ionicons name="calendar-outline" size={40} color={theme.text + '50'} />
              <Text style={[styles.emptyText, { color: theme.text, opacity: 0.6 }]}>
                No recent bookings
              </Text>
            </View>
          )}

          {stats.totalSalons === 0 && (
            <TouchableOpacity
              style={[styles.getStartedCard, { backgroundColor: '#4CAF50' }]}
              onPress={() => navigation.navigate('AddSalon' as never)}
            >
              <Ionicons name="rocket" size={24} color="#FFF" />
              <Text style={styles.getStartedText}>Get Started - Add Your First Salon!</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  greeting: { fontSize: 16, opacity: 0.7 },
  userName: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  notificationButton: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 60, right: 20 },
  content: { flex: 1 },
  section: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold' },
  viewAllText: { fontSize: 14, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statCard: { flex: 1, marginHorizontal: 5, padding: 20, borderRadius: 20, alignItems: 'center' },
  statIconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statTitle: { fontSize: 12, textAlign: 'center' },
  revenueNote: { marginHorizontal: 20, padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  revenueNoteText: { fontSize: 13, marginLeft: 10, flex: 1 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: (width - 60) / 2, padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 15 },
  actionIcon: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  recentBookingCard: { flexDirection: 'row', padding: 12, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
  statusIndicator: { width: 4, height: 40, borderRadius: 2, marginRight: 12 },
  bookingContent: { flex: 1 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  bookingCustomer: { fontSize: 15, fontWeight: '600', flex: 1 },
  bookingTime: { fontSize: 12, marginLeft: 8 },
  bookingService: { fontSize: 13 },
  emptyActivity: { padding: 40, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, marginTop: 10, textAlign: 'center' },
  getStartedCard: { flexDirection: 'row', padding: 20, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  getStartedText: { fontSize: 16, color: '#FFF', fontWeight: 'bold', marginLeft: 10 },
});
