import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { salonAPI } from '../services/api';

export default function SalonListScreen() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === 'dark';
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'distance'>('rating');

  const theme = isDark 
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', inputBg: '#0D0D0D' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', inputBg: '#F8F8F8' };

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      const response = await salonAPI.getAll();
      setSalons(response.data);
    } catch (error) {
      console.error('Error fetching salons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedSalons = salons
    .filter((salon: any) =>
      salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salon.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: any, b: any) => {
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0; // distance sorting would need location
    });

  const renderSalon = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.salonCard, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate('SalonDetail' as never, { id: item.id, from: 'customer' })}
    >
      <View style={[styles.salonImage, { backgroundColor: theme.inputBg }]}>
        <Ionicons name="storefront" size={40} color={theme.primary} />
      </View>
      <View style={styles.salonContent}>
        <View style={styles.salonHeader}>
          <Text style={[styles.salonName, { color: theme.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.is_active && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Open</Text>
            </View>
          )}
        </View>
        <Text style={[styles.salonAddress, { color: theme.text, opacity: 0.6 }]} numberOfLines={2}>
          {item.address}
        </Text>
        <View style={styles.salonFooter}>
          <View style={styles.rating}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={[styles.ratingText, { color: theme.text }]}>
              {item.rating || '0.0'} ({item.total_reviews || 0})
            </Text>
          </View>
          <Text style={[styles.hours, { color: theme.text, opacity: 0.5 }]}>
            {item.opening_time} - {item.closing_time}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>All Salons</Text>
        <TouchableOpacity onPress={() => setSortBy(sortBy === 'rating' ? 'distance' : 'rating')}>
          <Ionicons name="swap-vertical" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.inputBg }]}>
          <Ionicons name="search-outline" size={20} color={theme.text} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search salons..."
            placeholderTextColor={theme.text + '70'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredAndSortedSalons}
        renderItem={renderSalon}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchSalons} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={80} color={theme.text + '50'} />
            <Text style={[styles.emptyText, { color: theme.text }]}>
              {searchQuery ? 'No salons found' : 'No salons available'}
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
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingHorizontal: 15, height: 50 },
  searchInput: { flex: 1, fontSize: 16, marginLeft: 10 },
  list: { padding: 20 },
  salonCard: { flexDirection: 'row', borderRadius: 20, padding: 15, marginBottom: 15 },
  salonImage: { width: 90, height: 90, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  salonContent: { flex: 1 },
  salonHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  salonName: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  activeBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activeBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '600' },
  salonAddress: { fontSize: 14, marginBottom: 10 },
  salonFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, marginLeft: 6, fontWeight: '600' },
  hours: { fontSize: 12 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, marginTop: 20, textAlign: 'center' },
});
