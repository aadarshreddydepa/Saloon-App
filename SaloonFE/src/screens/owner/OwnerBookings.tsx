import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { bookingAPI } from '../../services/api';

export default function OwnerBookings() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === 'dark';
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unassigned' | 'today'>('all');

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

  const getFilteredBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (filter === 'unassigned') {
      return bookings.filter((b: any) => !b.barber && b.status !== 'cancelled');
    } else if (filter === 'today') {
      return bookings.filter((b: any) => b.booking_date === today);
    }
    return bookings;
  };

  const filteredBookings = getFilteredBookings();
  const stats = {
    total: bookings.length,
    unassigned: bookings.filter((b: any) => !b.barber && b.status === 'pending').length,
    today: bookings.filter((b: any) => b.booking_date === new Date().toISOString().split('T')[0]).length,
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

  const renderBooking = ({ item }: any) => (
    <View style={[styles.bookingCard, { backgroundColor: theme.card }]}>
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

      {item.barber_name ? (
        <View style={styles.barberInfo}>
          <Ionicons name="person" size={16} color="#4CAF50" />
          <Text style={[styles.barberName, { color: '#4CAF50' }]}>
            Assigned to: {item.barber_name}
          </Text>
        </View>
      ) : (
        <View style={styles.barberInfo}>
          <Ionicons name="alert-circle" size={16} color="#FF9800" />
          <Text style={[styles.unassignedText, { color: '#FF9800' }]}>
            Waiting for barber assignment
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>All Bookings</Text>
        <Text style={[styles.headerSubtitle, { color: theme.text, opacity: 0.6 }]}>
          View-only for monitoring
        </Text>
      </View>

      {/* Stats */}
      <View style={[styles.statsContainer, { backgroundColor: theme.card }]}>
        <TouchableOpacity 
          style={[styles.statItem, filter === 'all' && { backgroundColor: theme.primary + '20' }]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.statValue, { color: theme.text }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: theme.text }]}>Total</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.statItem, filter === 'unassigned' && { backgroundColor: '#FF980020' }]}
          onPress={() => setFilter('unassigned')}
        >
          <Text style={[styles.statValue, { color: '#FF9800' }]}>{stats.unassigned}</Text>
          <Text style={[styles.statLabel, { color: theme.text }]}>Unassigned</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.statItem, filter === 'today' && { backgroundColor: '#2196F320' }]}
          onPress={() => setFilter('today')}
        >
          <Text style={[styles.statValue, { color: '#2196F3' }]}>{stats.today}</Text>
          <Text style={[styles.statLabel, { color: theme.text }]}>Today</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={renderBooking}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBookings} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color={theme.text + '50'} />
            <Text style={[styles.emptyText, { color: theme.text }]}>No bookings found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { fontSize: 14 },
  statsContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, borderRadius: 15, padding: 10 },
  statItem: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 10, marginHorizontal: 5 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  bookingCard: { padding: 20, borderRadius: 20, marginBottom: 15 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  bookingId: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  customerName: { fontSize: 18, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  serviceName: { fontSize: 14, marginBottom: 4 },
  salonName: { fontSize: 14, marginBottom: 12 },
  bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dateTime: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 14, marginLeft: 6 },
  barberInfo: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.2)' },
  barberName: { fontSize: 13, fontWeight: '600', marginLeft: 6 },
  unassignedText: { fontSize: 13, fontWeight: '600', marginLeft: 6 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
});
