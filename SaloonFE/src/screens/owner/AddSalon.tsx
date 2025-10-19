import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { salonAPI } from '../../services/api';

export default function AddSalon() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    opening_time: '09:00',
    closing_time: '21:00',
  });

  const theme = isDark 
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', inputBg: '#0D0D0D' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', inputBg: '#FAFAFA' };

  const handleAddSalon = async () => {
    if (!formData.name || !formData.address || !formData.phone) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await salonAPI.create({
        name: formData.name,
        description: formData.description,
        address: formData.address,
        latitude: formData.latitude || '19.0760',
        longitude: formData.longitude || '72.8777',
        phone: formData.phone,
        opening_time: formData.opening_time + ':00',
        closing_time: formData.closing_time + ':00',
        is_active: true,
      });

      Alert.alert('Success', 'Salon added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Add salon error:', error.response?.data);
      Alert.alert('Error', 'Failed to add salon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Add New Salon</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.formCard, { backgroundColor: theme.card }]}>
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
              <Ionicons name="storefront-outline" size={20} color={theme.text} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Salon Name *"
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
              <Ionicons name="location-outline" size={20} color={theme.text} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Address *"
                placeholderTextColor={theme.text + '70'}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfInput, { backgroundColor: theme.inputBg }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Latitude (optional)"
                  placeholderTextColor={theme.text + '70'}
                  value={formData.latitude}
                  onChangeText={(text) => setFormData({ ...formData, latitude: text })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfInput, { backgroundColor: theme.inputBg }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Longitude (optional)"
                  placeholderTextColor={theme.text + '70'}
                  value={formData.longitude}
                  onChangeText={(text) => setFormData({ ...formData, longitude: text })}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
              <Ionicons name="call-outline" size={20} color={theme.text} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Phone Number *"
                placeholderTextColor={theme.text + '70'}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Working Hours</Text>
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfInput, { backgroundColor: theme.inputBg }]}>
                <Ionicons name="time-outline" size={20} color={theme.text} style={styles.icon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Opening (09:00)"
                  placeholderTextColor={theme.text + '70'}
                  value={formData.opening_time}
                  onChangeText={(text) => setFormData({ ...formData, opening_time: text })}
                />
              </View>

              <View style={[styles.inputContainer, styles.halfInput, { backgroundColor: theme.inputBg }]}>
                <Ionicons name="time-outline" size={20} color={theme.text} style={styles.icon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Closing (21:00)"
                  placeholderTextColor={theme.text + '70'}
                  value={formData.closing_time}
                  onChangeText={(text) => setFormData({ ...formData, closing_time: text })}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleAddSalon}
            disabled={loading}
          >
            <Text style={[styles.addButtonText, { color: isDark ? '#000' : '#FFF' }]}>
              {loading ? 'Adding Salon...' : 'Add Salon'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  formCard: { borderRadius: 20, padding: 20, marginBottom: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingHorizontal: 15, marginBottom: 15, minHeight: 55 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, paddingVertical: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { flex: 0.48 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 10, marginTop: 10 },
  addButton: { borderRadius: 15, paddingVertical: 18, alignItems: 'center', marginBottom: 40 },
  addButtonText: { fontSize: 18, fontWeight: 'bold' },
});
