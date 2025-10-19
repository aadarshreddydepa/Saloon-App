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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { salonAPI, serviceAPI, reviewAPI } from '../../services/api';

const { width } = Dimensions.get('window');

export default function CustomerSalonDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const isDark = useColorScheme() === 'dark';
  const [salon, setSalon] = useState<any>(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'reviews'>('services');
  const salonId = (route.params as any)?.id;

  const theme = isDark 
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', inputBg: '#0D0D0D' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', inputBg: '#FAFAFA' };

  useEffect(() => {
    if (salonId) {
      fetchSalonDetails();
    }
  }, [salonId]);

  const fetchSalonDetails = async () => {
    try {
      const [salonRes, servicesRes, reviewsRes] = await Promise.all([
        salonAPI.getById(salonId),
        serviceAPI.getBySalon(salonId),
        reviewAPI.getBySalon(salonId),
      ]);
      setSalon(salonRes.data);
      setServices(servicesRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error fetching salon details:', error);
      Alert.alert('Error', 'Failed to load salon details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service: any) => {
    navigation.navigate('BookAppointment' as never, { salon, service });
  };

  if (loading || !salon) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          {salon.name}
        </Text>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchSalonDetails} />}
      >
        {/* Salon Image Banner */}
        <View style={[styles.banner, { backgroundColor: theme.inputBg }]}>
          <Ionicons name="storefront" size={80} color={theme.primary} />
        </View>

        {/* Salon Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <View style={styles.titleRow}>
            <Text style={[styles.salonName, { color: theme.text }]}>{salon.name}</Text>
            {salon.is_active && (
              <View style={styles.openBadge}>
                <View style={styles.openDot} />
                <Text style={styles.openText}>Open</Text>
              </View>
            )}
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={[styles.ratingText, { color: theme.text }]}>
              {salon.rating || '0.0'} ({salon.total_reviews || 0} reviews)
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location" size={18} color={theme.text} />
            <Text style={[styles.infoText, { color: theme.text }]}>{salon.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call" size={18} color={theme.text} />
            <Text style={[styles.infoText, { color: theme.text }]}>{salon.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time" size={18} color={theme.text} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              {salon.opening_time} - {salon.closing_time}
            </Text>
          </View>

          {salon.description && (
            <Text style={[styles.description, { color: theme.text, opacity: 0.7 }]}>
              {salon.description}
            </Text>
          )}
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'services' && styles.activeTab]}
            onPress={() => setActiveTab('services')}
          >
            <Text style={[
              styles.tabText,
              { color: theme.text },
              activeTab === 'services' && { color: theme.primary, fontWeight: 'bold' }
            ]}>
              Services ({services.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[
              styles.tabText,
              { color: theme.text },
              activeTab === 'reviews' && { color: theme.primary, fontWeight: 'bold' }
            ]}>
              Reviews ({reviews.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'services' ? (
          <View style={styles.servicesSection}>
            {services.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
                <Ionicons name="cut-outline" size={60} color={theme.text + '50'} />
                <Text style={[styles.emptyText, { color: theme.text }]}>No services available</Text>
              </View>
            ) : (
              services.map((service: any) => (
                <View key={service.id} style={[styles.serviceCard, { backgroundColor: theme.card }]}>
                  <View style={styles.serviceHeader}>
                    <View style={styles.serviceInfo}>
                      <Text style={[styles.serviceName, { color: theme.text }]}>{service.name}</Text>
                      {service.description && (
                        <Text style={[styles.serviceDescription, { color: theme.text, opacity: 0.6 }]}>
                          {service.description}
                        </Text>
                      )}
                      <View style={styles.serviceFooter}>
                        <View style={styles.serviceDuration}>
                          <Ionicons name="time-outline" size={16} color={theme.text} />
                          <Text style={[styles.durationText, { color: theme.text }]}>
                            {service.duration} mins
                          </Text>
                        </View>
                        <Text style={[styles.servicePrice, { color: '#4CAF50' }]}>
                          ₹{service.price}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.bookButton, { backgroundColor: theme.primary }]}
                    onPress={() => handleBookService(service)}
                  >
                    <Text style={[styles.bookButtonText, { color: isDark ? '#000' : '#FFF' }]}>
                      Book
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.reviewsSection}>
            {reviews.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
                <Ionicons name="chatbubble-outline" size={60} color={theme.text + '50'} />
                <Text style={[styles.emptyText, { color: theme.text }]}>No reviews yet</Text>
              </View>
            ) : (
              reviews.map((review: any, index) => (
                <View key={index} style={[styles.reviewCard, { backgroundColor: theme.card }]}>
                  <View style={styles.reviewHeader}>
                    <View style={[styles.reviewAvatar, { backgroundColor: theme.inputBg }]}>
                      <Text style={[styles.reviewAvatarText, { color: theme.text }]}>
                        {review.customer_name?.[0]?.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.reviewInfo}>
                      <Text style={[styles.reviewName, { color: theme.text }]}>
                        {review.customer_name}
                      </Text>
                      <View style={styles.reviewRating}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < review.rating ? 'star' : 'star-outline'}
                            size={14}
                            color="#FFD700"
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={[styles.reviewComment, { color: theme.text }]}>
                    {review.comment}
                  </Text>
                  <Text style={[styles.reviewDate, { color: theme.text, opacity: 0.5 }]}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', flex: 1, marginHorizontal: 15 },
  banner: { height: 200, justifyContent: 'center', alignItems: 'center' },
  infoCard: { margin: 20, padding: 20, borderRadius: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  salonName: { fontSize: 24, fontWeight: 'bold', flex: 1 },
  openBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CAF5020', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50', marginRight: 5 },
  openText: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  ratingText: { fontSize: 16, marginLeft: 6, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoText: { fontSize: 15, marginLeft: 10, flex: 1 },
  description: { fontSize: 14, marginTop: 10, lineHeight: 20 },
  tabsContainer: { flexDirection: 'row', marginHorizontal: 20, borderRadius: 15, padding: 5, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeTab: {},
  tabText: { fontSize: 15 },
  servicesSection: { paddingHorizontal: 20, paddingBottom: 20 },
  serviceCard: { borderRadius: 15, padding: 15, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceHeader: { flex: 1 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  serviceDescription: { fontSize: 13, marginBottom: 8 },
  serviceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceDuration: { flexDirection: 'row', alignItems: 'center' },
  durationText: { fontSize: 13, marginLeft: 5 },
  servicePrice: { fontSize: 18, fontWeight: 'bold' },
  bookButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginLeft: 10 },
  bookButtonText: { fontSize: 14, fontWeight: 'bold' },
  reviewsSection: { paddingHorizontal: 20, paddingBottom: 20 },
  reviewCard: { borderRadius: 15, padding: 15, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', marginBottom: 10 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  reviewAvatarText: { fontSize: 18, fontWeight: 'bold' },
  reviewInfo: { flex: 1 },
  reviewName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  reviewRating: { flexDirection: 'row' },
  reviewComment: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  reviewDate: { fontSize: 12 },
  emptyContainer: { padding: 60, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  emptyText: { fontSize: 16, marginTop: 15 },
});
