import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { barberAPI } from '../../services/api';

export default function ManageBarbers() {
  const navigation = useNavigation();
  const route = useRoute();
  const isDark = useColorScheme() === 'dark';
  const [barbers, setBarbers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'barbers' | 'requests'>('barbers');
  const salonId = (route.params as any)?.salonId;

  const theme = isDark 
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', inputBg: '#0D0D0D' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', inputBg: '#FAFAFA' };

  useEffect(() => {
    if (salonId) {
      fetchData();
    }
  }, [salonId]);

  const fetchData = async () => {
    try {
      const [barbersRes, requestsRes] = await Promise.all([
        barberAPI.getBySalon(salonId),
        barberAPI.getJoinRequests(salonId),
      ]);
      setBarbers(barbersRes.data);
      setJoinRequests(requestsRes.data);
    } catch (error) {
      console.error('Error fetching barber data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    Alert.alert(
      'Approve Request',
      'Are you sure you want to approve this barber?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await barberAPI.approveRequest(requestId);
              Alert.alert('Success', 'Barber approved successfully');
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'Failed to approve request');
            }
          },
        },
      ]
    );
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await barberAPI.rejectRequest(requestId);
      Alert.alert('Success', 'Request rejected');
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject request');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Manage Barbers</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.tabsContainer, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'barbers' && { backgroundColor: theme.primary }]}
          onPress={() => setActiveTab('barbers')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'barbers' ? (isDark ? '#000' : '#FFF') : theme.text }
          ]}>
            Barbers ({barbers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && { backgroundColor: theme.primary }]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'requests' ? (isDark ? '#000' : '#FFF') : theme.text }
          ]}>
            Requests ({joinRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
        contentContainerStyle={styles.content}
      >
        {activeTab === 'barbers' ? (
          barbers.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
              <Ionicons name="people-outline" size={60} color={theme.text + '50'} />
              <Text style={[styles.emptyText, { color: theme.text }]}>No barbers yet</Text>
            </View>
          ) : (
            barbers.map((barber: any) => (
              <View key={barber.id} style={[styles.barberCard, { backgroundColor: theme.card }]}>
                <View style={[styles.barberAvatar, { backgroundColor: theme.inputBg }]}>
                  <Ionicons name="person" size={30} color={theme.primary} />
                </View>
                <View style={styles.barberInfo}>
                  <Text style={[styles.barberName, { color: theme.text }]}>
                    {barber.user_name}
                  </Text>
                  <Text style={[styles.barberSpec, { color: theme.text, opacity: 0.6 }]}>
                    {barber.specialization || 'Barber'}
                  </Text>
                  <View style={styles.barberMeta}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={[styles.barberRating, { color: theme.text }]}>
                      {barber.rating || '0.0'}
                    </Text>
                    <Text style={[styles.barberExp, { color: theme.text, opacity: 0.5 }]}>
                      • {barber.experience_years || 0} yrs
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: barber.is_available ? '#4CAF5020' : '#F4433620' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: barber.is_available ? '#4CAF50' : '#F44336' }
                  ]}>
                    {barber.is_available ? 'Available' : 'Busy'}
                  </Text>
                </View>
              </View>
            ))
          )
        ) : (
          joinRequests.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
              <Ionicons name="mail-outline" size={60} color={theme.text + '50'} />
              <Text style={[styles.emptyText, { color: theme.text }]}>No pending requests</Text>
            </View>
          ) : (
            joinRequests.map((request: any) => (
              <View key={request.id} style={[styles.requestCard, { backgroundColor: theme.card }]}>
                <View style={[styles.requestAvatar, { backgroundColor: theme.inputBg }]}>
                  <Text style={[styles.requestAvatarText, { color: theme.text }]}>
                    {request.barber_name?.[0]?.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.requestInfo}>
                  <Text style={[styles.requestName, { color: theme.text }]}>
                    {request.barber_name}
                  </Text>
                  <Text style={[styles.requestMessage, { color: theme.text, opacity: 0.6 }]}>
                    {request.message}
                  </Text>
                  <Text style={[styles.requestDate, { color: theme.text, opacity: 0.4 }]}>
                    {new Date(request.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.approveButton, { backgroundColor: '#4CAF50' }]}
                    onPress={() => handleApproveRequest(request.id)}
                  >
                    <Ionicons name="checkmark" size={24} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.rejectButton, { backgroundColor: '#F44336' }]}
                    onPress={() => handleRejectRequest(request.id)}
                  >
                    <Ionicons name="close" size={24} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  tabsContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, padding: 5, borderRadius: 15 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  tabText: { fontSize: 15, fontWeight: '600' },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  barberCard: { flexDirection: 'row', padding: 15, borderRadius: 15, marginBottom: 12, alignItems: 'center' },
  barberAvatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  barberInfo: { flex: 1 },
  barberName: { fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  barberSpec: { fontSize: 13, marginBottom: 6 },
  barberMeta: { flexDirection: 'row', alignItems: 'center' },
  barberRating: { fontSize: 13, marginLeft: 4, fontWeight: '600' },
  barberExp: { fontSize: 12, marginLeft: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
  requestCard: { flexDirection: 'row', padding: 15, borderRadius: 15, marginBottom: 12, alignItems: 'center' },
  requestAvatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  requestAvatarText: { fontSize: 20, fontWeight: 'bold' },
  requestInfo: { flex: 1 },
  requestName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  requestMessage: { fontSize: 13, marginBottom: 4 },
  requestDate: { fontSize: 11 },
  requestActions: { flexDirection: 'row' },
  approveButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  rejectButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  emptyContainer: { padding: 60, borderRadius: 20, alignItems: 'center' },
  emptyText: { fontSize: 16, marginTop: 15 },
});
