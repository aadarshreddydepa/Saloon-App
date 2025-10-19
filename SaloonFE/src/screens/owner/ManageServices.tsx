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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { serviceAPI } from '../../services/api';

export default function ManageServices() {
  const navigation = useNavigation();
  const route = useRoute();
  const isDark = useColorScheme() === 'dark';
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const salonId = (route.params as any)?.salonId;

  const theme = isDark 
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000' };

  useEffect(() => {
    if (salonId) {
      fetchServices();
    }
  }, [salonId]);

  const fetchServices = async () => {
    try {
      const response = await serviceAPI.getBySalon(salonId);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderService = ({ item }: any) => (
    <View style={[styles.serviceCard, { backgroundColor: theme.card }]}>
      <View style={styles.serviceHeader}>
        <Text style={[styles.serviceName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.servicePrice, { color: '#4CAF50' }]}>₹{item.price}</Text>
      </View>
      <Text style={[styles.serviceDescription, { color: theme.text, opacity: 0.6 }]}>
        {item.description || 'No description'}
      </Text>
      <View style={styles.serviceFooter}>
        <View style={styles.duration}>
          <Ionicons name="time-outline" size={16} color={theme.text} />
          <Text style={[styles.durationText, { color: theme.text }]}>{item.duration} mins</Text>
        </View>
        <Text style={[styles.status, { color: item.is_active ? '#4CAF50' : '#F44336' }]}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Services</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddService' as never)}>
          <Ionicons name="add-circle" size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchServices} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={80} color={theme.text + '50'} />
            <Text style={[styles.emptyText, { color: theme.text }]}>No services yet</Text>
            <Text style={[styles.emptySubtext, { color: theme.text, opacity: 0.6 }]}>
              Tap + to add services
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  list: { padding: 20 },
  serviceCard: { padding: 20, borderRadius: 20, marginBottom: 15 },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  serviceName: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  servicePrice: { fontSize: 18, fontWeight: 'bold' },
  serviceDescription: { fontSize: 14, marginBottom: 12 },
  serviceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  duration: { flexDirection: 'row', alignItems: 'center' },
  durationText: { fontSize: 14, marginLeft: 6 },
  status: { fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptySubtext: { fontSize: 14, marginTop: 8 },
});
