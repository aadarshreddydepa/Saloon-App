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
import { salonAPI, bookingAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

export default function OwnerDashboard() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === 'dark';
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSalons: 0,
    totalBookings: 0,
    todayBookings: 0,
    revenue: 0,
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
      const bookings = bookingsRes.data;
      const today = new Date().toISOString().split('T')[0];

      setStats({
        totalSalons: salons.length || 0,
        totalBookings: bookings.length || 0,
        todayBookings: bookings.filter((b: any) => b.booking_date === today).length || 0,
        revenue: bookings.reduce((sum: number, b: any) => sum + (parseFloat(b.service_price) || 0), 0),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { id: 1, title: 'Add Salon', icon: 'add-circle', color: '#4CAF50', screen: 'AddSalon' },
    { id: 2, title: 'Manage Salons', icon: 'storefront', color: '#2196F3', screen: 'My Salons' },
    { id: 3, title: 'Add Services', icon: 'list', color: '#FF9800', screen: 'AddService' },
    { id: 4, title: 'View Bookings', icon: 'calendar', color: '#9C27B0', screen: 'Bookings' },
  ];

  const handleQuickAction = (screen: string) => {
    if (screen === 'My Salons' || screen === 'Bookings') {
      // Navigate to tab
      navigation.navigate(screen as never);
    } else {
      // Navigate to stack screen
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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard title="Total Salons" value={stats.totalSalons} icon="storefront" color="#4CAF50" />
            <StatCard title="Total Bookings" value={stats.totalBookings} icon="calendar" color="#2196F3" />
          </View>
          <View style={styles.statsGrid}>
            <StatCard title="Today's Bookings" value={stats.todayBookings} icon="today" color="#FF9800" />
            <StatCard title="Revenue" value={`₹${stats.revenue.toFixed(0)}`} icon="cash" color="#9C27B0" />
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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
          <View style={[styles.activityCard, { backgroundColor: theme.card }]}>
            <Ionicons name="time-outline" size={24} color={theme.text} />
            <Text style={[styles.activityText, { color: theme.text }]}>
              {stats.todayBookings} new bookings today
            </Text>
          </View>
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
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statCard: { flex: 1, marginHorizontal: 5, padding: 20, borderRadius: 20, alignItems: 'center' },
  statIconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statTitle: { fontSize: 12, textAlign: 'center' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: (width - 60) / 2, padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 15 },
  actionIcon: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  activityCard: { flexDirection: 'row', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  activityText: { fontSize: 16, marginLeft: 15 },
  getStartedCard: { flexDirection: 'row', padding: 20, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  getStartedText: { fontSize: 16, color: '#FFF', fontWeight: 'bold', marginLeft: 10 },
});
