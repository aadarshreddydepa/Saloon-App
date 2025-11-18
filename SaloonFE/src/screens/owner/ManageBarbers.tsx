import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  RefreshControl,
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
  const [processing, setProcessing] = useState(false);
  const salonId = (route.params as any)?.salonId;

  const theme = isDark
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', inputBg: '#0D0D0D', border: '#333333' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', inputBg: '#FAFAFA', border: '#E0E0E0' };

  useEffect(() => {
    if (salonId) {
      fetchBarbers();
      fetchJoinRequests();
    }
  }, [salonId]);

  const fetchBarbers = async () => {
    try {
      const response = await barberAPI.getBySalon(salonId);
      setBarbers(response.data);
    } catch (error) {
      console.error('Error fetching barbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      const response = await barberAPI.getJoinRequests(salonId);
      setJoinRequests(response.data.filter((req: any) => req.status === 'pending'));
    } catch (error) {
      console.error('Error fetching join requests:', error);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    setProcessing(true);
    try {
      await barberAPI.approveRequest(requestId);
      Alert.alert('Success', 'Join request approved!');
      fetchBarbers();
      fetchJoinRequests();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this join request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessing(true);
            try {
              await barberAPI.rejectRequest(requestId);
              Alert.alert('Success', 'Join request rejected');
              fetchJoinRequests();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject request');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveBarber = async (barberId: number, barberName: string) => {
    Alert.alert(
      'Remove Barber',
      `Are you sure you want to remove ${barberName} from this salon?\n\n⚠️ This will:\n• Remove their access to this salon\n• Reassign their pending bookings\n• They can request to join again later`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setProcessing(true);
            try {
              await barberAPI.removeFromSalon(barberId);
              Alert.alert('Success', 'Barber removed successfully');
              fetchBarbers();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to remove barber');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              fetchBarbers();
              fetchJoinRequests();
            }}
          />
        }
      >
        {/* Join Requests Section */}
        {joinRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Join Requests ({joinRequests.length})
              </Text>
              <View style={[styles.badge, { backgroundColor: '#FF9800' }]}>
                <Text style={styles.badgeText}>{joinRequests.length}</Text>
              </View>
            </View>

            {joinRequests.map((request: any) => (
              <View key={request.id} style={[styles.requestCard, { backgroundColor: theme.card }]}>
                <View style={[styles.requestIconContainer, { backgroundColor: '#FF980020' }]}>
                  <Ionicons name="person-add" size={24} color="#FF9800" />
                </View>
                <View style={styles.requestInfo}>
                  <Text style={[styles.requestName, { color: theme.text }]}>
                    {request.barber_name}
                  </Text>
                  {request.message && (
                    <Text style={[styles.requestMessage, { color: theme.text, opacity: 0.7 }]} numberOfLines={2}>
                      {request.message}
                    </Text>
                  )}
                  <Text style={[styles.requestDate, { color: theme.text, opacity: 0.5 }]}>
                    {new Date(request.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                    onPress={() => handleApproveRequest(request.id)}
                    disabled={processing}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#F44336', marginTop: 8 }]}
                    onPress={() => handleRejectRequest(request.id)}
                    disabled={processing}
                  >
                    <Ionicons name="close" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Current Barbers Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Current Barbers ({barbers.length})
          </Text>

          {barbers.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <Ionicons name="people-outline" size={50} color={theme.text + '50'} />
              <Text style={[styles.emptyText, { color: theme.text }]}>No barbers yet</Text>
              <Text style={[styles.emptySubtext, { color: theme.text, opacity: 0.6 }]}>
                Barbers can send join requests to work at this salon
              </Text>
            </View>
          ) : (
            barbers.map((barber: any) => (
              <View key={barber.id} style={[styles.barberCard, { backgroundColor: theme.card }]}>
                <View style={[styles.barberAvatar, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={[styles.barberInitial, { color: theme.primary }]}>
                    {barber.user_name?.charAt(0).toUpperCase() || 'B'}
                  </Text>
                </View>
                <View style={styles.barberInfo}>
                  <Text style={[styles.barberName, { color: theme.text }]}>
                    {barber.user_name}
                  </Text>
                  {barber.specialization && (
                    <Text style={[styles.barberSpecialization, { color: theme.text, opacity: 0.7 }]}>
                      {barber.specialization}
                    </Text>
                  )}
                  <View style={styles.barberMeta}>
                    {barber.experience_years > 0 && (
                      <View style={styles.metaItem}>
                        <Ionicons name="briefcase-outline" size={14} color={theme.text} />
                        <Text style={[styles.metaText, { color: theme.text, opacity: 0.6 }]}>
                          {barber.experience_years} years
                        </Text>
                      </View>
                    )}
                    <View style={styles.metaItem}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={[styles.metaText, { color: theme.text, opacity: 0.6 }]}>
                        {barber.rating || '0.0'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: barber.is_available ? '#4CAF50' : '#F44336' },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {barber.is_available ? 'Available' : 'Busy'}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.removeButton, { backgroundColor: '#F4433620' }]}
                  onPress={() => handleRemoveBarber(barber.id, barber.user_name)}
                  disabled={processing}
                >
                  <Ionicons name="trash-outline" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  section: { padding: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  requestCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    alignItems: 'center',
  },
  requestIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestInfo: { flex: 1 },
  requestName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  requestMessage: { fontSize: 13, marginBottom: 4 },
  requestDate: { fontSize: 11 },
  requestActions: { marginLeft: 12 },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: { padding: 40, borderRadius: 20, alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginTop: 15 },
  emptySubtext: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  barberCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    alignItems: 'center',
  },
  barberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  barberInitial: { fontSize: 24, fontWeight: 'bold' },
  barberInfo: { flex: 1 },
  barberName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  barberSpecialization: { fontSize: 14, marginBottom: 6 },
  barberMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12, marginTop: 4 },
  metaText: { fontSize: 12, marginLeft: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '600' },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
