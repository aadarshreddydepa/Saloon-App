import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { salonAPI, serviceAPI } from '../../services/api';

export default function AddService() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(false);
  const [salons, setSalons] = useState([]);
  const [loadingSalons, setLoadingSalons] = useState(true);
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
  });

  const theme = isDark 
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', inputBg: '#0D0D0D' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', inputBg: '#FAFAFA' };

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      const response = await salonAPI.getAll();
      setSalons(response.data);
      if (response.data.length > 0) {
        setSelectedSalon(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching salons:', error);
      Alert.alert('Error', 'Failed to load salons');
    } finally {
      setLoadingSalons(false);
    }
  };

  const handleAddService = async () => {
    if (!formData.name || !formData.price || !formData.duration || !selectedSalon) {
      Alert.alert('Error', 'Please fill all required fields and select a salon');
      return;
    }

    setLoading(true);
    try {
      await serviceAPI.create({
        salon: selectedSalon.id,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        duration: parseInt(formData.duration),
        is_active: true,
      });

      Alert.alert('Success', 'Service added successfully!', [
        { text: 'Add Another', onPress: () => setFormData({ name: '', description: '', price: '', duration: '' }) },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Add service error:', error.response?.data);
      Alert.alert('Error', 'Failed to add service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingSalons) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (salons.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={[styles.header, { backgroundColor: theme.card }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Add Service</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="storefront-outline" size={80} color={theme.text + '50'} />
          <Text style={[styles.emptyText, { color: theme.text }]}>No Salons Yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.text, opacity: 0.6 }]}>
            Please add a salon first before adding services
          </Text>
          <TouchableOpacity
            style={[styles.addSalonButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('AddSalon' as never)}
          >
            <Text style={[styles.addSalonButtonText, { color: isDark ? '#000' : '#FFF' }]}>
              Add Salon
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Add Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.formCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.label, { color: theme.text }]}>Select Salon</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.salonScroll}>
            {salons.map((salon: any) => (
              <TouchableOpacity
                key={salon.id}
                style={[
                  styles.salonChip,
                  { 
                    backgroundColor: selectedSalon?.id === salon.id ? theme.primary : theme.inputBg,
                    borderColor: selectedSalon?.id === salon.id ? theme.primary : theme.inputBg,
                  }
                ]}
                onPress={() => setSelectedSalon(salon)}
              >
                <Text style={[styles.salonChipText, { color: selectedSalon?.id === salon.id ? (isDark ? '#000' : '#FFF') : theme.text }]}>
                  {salon.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
            <Ionicons name="cut-outline" size={20} color={theme.text} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Service Name *"
              placeholderTextColor={theme.text + '70'}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
            <Ionicons name="document-text-outline" size={20} color={theme.text} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Description"
              placeholderTextColor={theme.text + '70'}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
            <Ionicons name="cash-outline" size={20} color={theme.text} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Price (₹) *"
              placeholderTextColor={theme.text + '70'}
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
            <Ionicons name="time-outline" size={20} color={theme.text} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Duration (minutes) *"
              placeholderTextColor={theme.text + '70'}
              value={formData.duration}
              onChangeText={(text) => setFormData({ ...formData, duration: text })}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleAddService}
          disabled={loading}
        >
          <Text style={[styles.addButtonText, { color: isDark ? '#000' : '#FFF' }]}>
            {loading ? 'Adding Service...' : 'Add Service'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  formCard: { borderRadius: 20, padding: 20, marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  salonScroll: { marginBottom: 20 },
  salonChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, marginRight: 10, borderWidth: 2 },
  salonChipText: { fontSize: 14, fontWeight: '600' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingHorizontal: 15, marginBottom: 15, minHeight: 55 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, paddingVertical: 10 },
  addButton: { borderRadius: 15, paddingVertical: 18, alignItems: 'center', marginBottom: 40 },
  addButtonText: { fontSize: 18, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  emptySubtext: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  addSalonButton: { paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15 },
  addSalonButtonText: { fontSize: 16, fontWeight: 'bold' },
});
