import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const isDark = useColorScheme() === 'dark';

  const theme = isDark 
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', border: '#333333', inputBg: '#0D0D0D' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', border: '#E0E0E0', inputBg: '#F8F8F8' };

  const categories = [
    { id: 1, name: 'Haircut', icon: 'cut' },
    { id: 2, name: 'Shaving', icon: 'man' },
    { id: 3, name: 'Facial', icon: 'happy' },
    { id: 4, name: 'Massage', icon: 'hand-left' },
  ];

  const popularSalons = [
    { id: 1, name: 'Luxury Salon', rating: 4.8, distance: '2.5 km' },
    { id: 2, name: 'Style Studio', rating: 4.6, distance: '3.2 km' },
    { id: 3, name: 'Gents Parlour', rating: 4.9, distance: '1.8 km' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>Hello! 👋</Text>
            <Text style={[styles.userName, { color: theme.text }]}>Find Your Perfect Salon</Text>
          </View>
          <TouchableOpacity style={[styles.notificationButton, { backgroundColor: theme.inputBg }]}>
            <Ionicons name="notifications-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: theme.inputBg }]}>
          <Ionicons name="search-outline" size={20} color={theme.text} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search salons, services..."
            placeholderTextColor={theme.text + '80'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: theme.card }]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: theme.inputBg }]}>
                  <Ionicons name={category.icon as any} size={32} color={theme.primary} />
                </View>
                <Text style={[styles.categoryName, { color: theme.text }]}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Popular Salons</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Salons' as never)}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {popularSalons.map((salon) => (
            <TouchableOpacity
              key={salon.id}
              style={[styles.salonCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('SalonDetail' as never, { id: salon.id })}
            >
              <View style={[styles.salonImage, { backgroundColor: theme.inputBg }]}>
                <Ionicons name="storefront" size={32} color={theme.primary} />
              </View>
              <View style={styles.salonInfo}>
                <Text style={[styles.salonName, { color: theme.text }]}>{salon.name}</Text>
                <View style={styles.salonMeta}>
                  <View style={styles.rating}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={[styles.ratingText, { color: theme.text }]}>{salon.rating}</Text>
                  </View>
                  <View style={styles.distance}>
                    <Ionicons name="location-outline" size={16} color={theme.text} />
                    <Text style={[styles.distanceText, { color: theme.text }]}>{salon.distance}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.text} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 16, opacity: 0.7 },
  userName: { fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  notificationButton: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingHorizontal: 15, height: 55 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  content: { flex: 1 },
  section: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 15 },
  categoryCard: { width: (width - 60) / 2, borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 15 },
  categoryIcon: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  categoryName: { fontSize: 16, fontWeight: '600' },
  salonCard: { flexDirection: 'row', borderRadius: 20, padding: 15, marginBottom: 15, alignItems: 'center' },
  salonImage: { width: 70, height: 70, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  salonInfo: { flex: 1 },
  salonName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  salonMeta: { flexDirection: 'row', alignItems: 'center' },
  rating: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  ratingText: { fontSize: 14, marginLeft: 4, fontWeight: '600' },
  distance: { flexDirection: 'row', alignItems: 'center' },
  distanceText: { fontSize: 14, marginLeft: 4 },
});
