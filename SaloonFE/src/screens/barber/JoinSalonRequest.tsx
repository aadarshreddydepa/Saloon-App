import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { salonAPI, barberAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function JoinSalonRequest() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === 'dark';
  const { user } = useAuthStore();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBarberInfo, setCurrentBarberInfo] = useState<any>(null);

  const theme = isDark 
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', inputBg: '#0D0D0D' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', inputBg: '#FAFAFA' };

  useEffect(() => {
    fetchSalons();
    checkBarberStatus();
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

  const checkBarberStatus = async () => {
    try {
      const response = await barberAPI.getAll();
      const myBarber = response.data.find((b: any) => b.user_id === user?.id);
      setCurrentBarberInfo(myBarber);
    } catch (error) {
      console.error('Error checking barber status:', error);
    }
  };

  const handleSendRequest = async (salon: any) => {
    if (currentBarberInfo?.salon) {
      Alert.alert('Already Joined', 'You are already part of a salon. You can only join one salon at a time.');
      return;
    }

    Alert.alert(
      'Send Join Request',
      `Do you want to send a join request to ${salon.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: async () => {
            try {
              await barberAPI.sendJoinRequest(salon.id, {
                message: `Hi, I'm ${user?.first_name || user?.username} and I'd like to join your salon.`,
              });
              Alert.alert('Success', 'Join request sent successfully!');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to send request');
            }
          },
        },
      ]
    );
  };

  const filteredSalons = salons.filter((salon: any) =>
    salon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSalon = ({ item }: any) => (
    <View style={[styles.salonCard, { backgroundColor: theme.card }]}>
      <View style={[styles.salonIcon, { backgroundColor: theme.inputBg }]}>
        <Ionicons name="storefront" size={32} color={theme.primary} />
      </View>
      <View style={styles.salonInfo}>
        <Text style={[styles.salonName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.salonAddress, { color: theme.text, opacity: 0.6 }]} numberOfLines={1}>
          {item.address}
        </Text>
        <View style={styles.salonMeta}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={[styles.ratingText, { color: theme.text }]}>
            {item.rating || '0.0'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.requestButton, { backgroundColor: theme.primary }]}
        onPress={() => handleSendRequest(item)}
        disabled={!!currentBarberInfo?.salon}
      >
        <Ionicons name="send" size={20} color={isDark ? '#000' : '#FFF'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Join a Salon</Text>
        <View style={{ width: 24 }} />
      </View>

      {currentBarberInfo?.salon && (
        <View style={[styles.warningBanner, { backgroundColor: '#FF9800' }]}>
          <Ionicons name="information-circle" size={24} color="#FFF" />
          <Text style={styles.warningText}>
            You are already part of {currentBarberInfo.salon_name}
          </Text>
        </View>
      )}

      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Ionicons name="search-outline" size={20} color={theme.text} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search salons..."
          placeholderTextColor={theme.text + '70'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredSalons}
        renderItem={renderSalon}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchSalons} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  warningBanner: { flexDirection: 'row', alignItems: 'center', padding: 15, marginHorizontal: 20, marginBottom: 15, borderRadius: 15 },
  warningText: { color: '#FFF', fontSize: 14, marginLeft: 10, flex: 1, fontWeight: '600' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 20, padding: 15, borderRadius: 15 },
  searchInput: { flex: 1, fontSize: 16, marginLeft: 10 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  salonCard: { flexDirection: 'row', padding: 15, borderRadius: 20, marginBottom: 15, alignItems: 'center' },
  salonIcon: { width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  salonInfo: { flex: 1 },
  salonName: { fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  salonAddress: { fontSize: 13, marginBottom: 6 },
  salonMeta: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, marginLeft: 4, fontWeight: '600' },
  requestButton: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
});
