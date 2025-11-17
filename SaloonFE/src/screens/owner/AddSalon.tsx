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
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { salonAPI } from '../../services/api';
import imageService from '../../services/imageService';
import ImageGallery from '../../components/ImageGallery';

export default function AddSalon() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [showOpeningPicker, setShowOpeningPicker] = useState(false);
  const [showClosingPicker, setShowClosingPicker] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    opening_time: '09:00',
    closing_time: '21:00',
    latitude: '0.0',
    longitude: '0.0',
    cover_image: '',
    gallery_images: [] as string[],
  });

  const isDark = useColorScheme() === 'dark';

  const theme = isDark
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', inputBg: '#0D0D0D', border: '#333333' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', inputBg: '#FAFAFA', border: '#E0E0E0' };

  const handleUploadCoverImage = async () => {
    setUploadingCover(true);
    try {
      const uris = await imageService.showImagePickerOptions(false);
      if (uris && uris.length > 0) {
        const url = await imageService.uploadToCloudinary(uris[0], 'salons/covers');
        if (url) {
          setFormData({ ...formData, cover_image: url });
          Alert.alert('Success', 'Cover image uploaded!');
        }
      }
    } finally {
      setUploadingCover(false);
    }
  };

  const handleUploadGalleryImage = async () => {
    setUploadingGallery(true);
    try {
      const uris = await imageService.showImagePickerOptions(false);
      if (uris && uris.length > 0) {
        const url = await imageService.uploadToCloudinary(uris[0], 'salons/gallery');
        if (url) {
          setFormData({
            ...formData,
            gallery_images: [...formData.gallery_images, url],
          });
          Alert.alert('Success', 'Image added to gallery!');
        }
      }
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryImage = (index: number) => {
    const newGallery = formData.gallery_images.filter((_, i) => i !== index);
    setFormData({ ...formData, gallery_images: newGallery });
  };

  const handleTimeChange = (event: any, selectedDate: Date | undefined, type: 'opening' | 'closing') => {
    if (Platform.OS === 'android') {
      setShowOpeningPicker(false);
      setShowClosingPicker(false);
    }

    if (selectedDate) {
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      if (type === 'opening') {
        setFormData({ ...formData, opening_time: timeString });
      } else {
        setFormData({ ...formData, closing_time: timeString });
      }
    }
  };

  const getDateFromTime = (timeString: string): Date => {
    const date = new Date();
    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    return date;
  };

  const handleGetLocation = async () => {
    try {
      setFetchingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location access to use this feature');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const roundedLat = parseFloat(latitude.toFixed(6));
      const roundedLng = parseFloat(longitude.toFixed(6));

      const addressResults = await Location.reverseGeocodeAsync({
        latitude: roundedLat,
        longitude: roundedLng,
      });

      if (addressResults.length > 0) {
        const addressData = addressResults[0];
        
        const formattedAddress = [
          addressData.name,
          addressData.street,
          addressData.city,
          addressData.region,
          addressData.postalCode,
          addressData.country,
        ]
          .filter(Boolean)
          .join(', ');

        setFormData({
          ...formData,
          address: formattedAddress,
          latitude: roundedLat.toString(),
          longitude: roundedLng.toString(),
        });

        Alert.alert('Location Found', 'Address and coordinates updated successfully');
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to fetch location. Please try again.');
    } finally {
      setFetchingLocation(false);
    }
  };

  const handleAddSalon = async () => {
    if (!formData.name || !formData.address || !formData.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.latitude === '0.0' || formData.longitude === '0.0') {
      Alert.alert('Error', 'Please get location coordinates');
      return;
    }

    setLoading(true);
    try {
      await salonAPI.create(formData);
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Add Salon</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Cover Image</Text>
          {formData.cover_image ? (
            <View style={styles.coverImageContainer}>
              <Image source={{ uri: formData.cover_image }} style={styles.coverImage} />
              <TouchableOpacity
                style={styles.changeCoverButton}
                onPress={handleUploadCoverImage}
                disabled={uploadingCover}
              >
                {uploadingCover ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="camera" size={20} color="#FFF" />
                    <Text style={styles.changeCoverText}>Change</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.uploadCoverButton, { backgroundColor: theme.inputBg }]}
              onPress={handleUploadCoverImage}
              disabled={uploadingCover}
            >
              {uploadingCover ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <>
                  <Ionicons name="image" size={48} color={theme.primary} />
                  <Text style={[styles.uploadText, { color: theme.text }]}>
                    Upload Cover Image
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Gallery ({formData.gallery_images.length})
            </Text>
            <TouchableOpacity
              style={[styles.addGalleryButton, { backgroundColor: theme.primary }]}
              onPress={handleUploadGalleryImage}
              disabled={uploadingGallery}
            >
              {uploadingGallery ? (
                <ActivityIndicator color={isDark ? '#000' : '#FFF'} size="small" />
              ) : (
                <>
                  <Ionicons name="add" size={20} color={isDark ? '#000' : '#FFF'} />
                  <Text style={[styles.addGalleryText, { color: isDark ? '#000' : '#FFF' }]}>
                    Add Photo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {formData.gallery_images.length > 0 ? (
            <ImageGallery
              images={formData.gallery_images}
              onDelete={handleDeleteGalleryImage}
              editable
            />
          ) : (
            <Text style={[styles.emptyGalleryText, { color: theme.text, opacity: 0.5 }]}>
              No images yet. Add photos to showcase your salon.
            </Text>
          )}
        </View>

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

          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <Text style={[styles.locationLabel, { color: theme.text }]}>Location *</Text>
              <TouchableOpacity
                style={[styles.locationButton, { backgroundColor: '#2196F3' }]}
                onPress={handleGetLocation}
                disabled={fetchingLocation}
              >
                {fetchingLocation ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="location" size={16} color="#FFF" />
                    <Text style={styles.locationButtonText}>Get Location</Text>
                  </>
                )}
              </TouchableOpacity>
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

            {formData.latitude !== '0.0' && formData.longitude !== '0.0' && (
              <View style={[styles.coordinatesBox, { backgroundColor: theme.inputBg, borderColor: theme.border, borderWidth: 1 }]}>
                <Ionicons name="pin" size={14} color="#4CAF50" />
                <Text style={[styles.coordinatesText, { color: theme.text }]}>
                  Lat: {parseFloat(formData.latitude).toFixed(4)}, Long: {parseFloat(formData.longitude).toFixed(4)}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
            <Ionicons name="call-outline" size={20} color={theme.text} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Phone *"
              placeholderTextColor={theme.text + '70'}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={[styles.timeLabel, { color: theme.text }]}>Operating Hours</Text>
          <View style={styles.timeRow}>
            <TouchableOpacity
              style={[styles.timePickerButton, { backgroundColor: theme.inputBg, borderColor: theme.border, borderWidth: 1 }]}
              onPress={() => setShowOpeningPicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={theme.text} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.timePickerLabel, { color: theme.text, opacity: 0.6 }]}>Opening</Text>
                <Text style={[styles.timePickerValue, { color: theme.text }]}>{formData.opening_time}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.timePickerButton, { backgroundColor: theme.inputBg, borderColor: theme.border, borderWidth: 1 }]}
              onPress={() => setShowClosingPicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={theme.text} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.timePickerLabel, { color: theme.text, opacity: 0.6 }]}>Closing</Text>
                <Text style={[styles.timePickerValue, { color: theme.text }]}>{formData.closing_time}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleAddSalon}
          disabled={loading}
        >
          <Text style={[styles.submitButtonText, { color: isDark ? '#000' : '#FFF' }]}>
            {loading ? 'Adding Salon...' : 'Add Salon'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {showOpeningPicker && (
        <DateTimePicker
          value={getDateFromTime(formData.opening_time)}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => handleTimeChange(event, date, 'opening')}
        />
      )}

      {showClosingPicker && (
        <DateTimePicker
          value={getDateFromTime(formData.closing_time)}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => handleTimeChange(event, date, 'closing')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1 },
  section: { margin: 20, padding: 20, borderRadius: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  coverImageContainer: { position: 'relative' },
  coverImage: { width: '100%', height: 200, borderRadius: 15 },
  changeCoverButton: { position: 'absolute', bottom: 15, right: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  changeCoverText: { color: '#FFF', marginLeft: 8, fontWeight: '600' },
  uploadCoverButton: { height: 200, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: '#CCC' },
  uploadText: { fontSize: 14, marginTop: 10, fontWeight: '600' },
  addGalleryButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  addGalleryText: { marginLeft: 5, fontWeight: '600' },
  emptyGalleryText: { textAlign: 'center', fontSize: 14, paddingVertical: 30 },
  formCard: { margin: 20, padding: 20, borderRadius: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingHorizontal: 15, marginBottom: 15, minHeight: 55 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, paddingVertical: 10 },
  locationSection: { marginBottom: 15 },
  locationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  locationLabel: { fontSize: 14, fontWeight: '600' },
  locationButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  locationButtonText: { color: '#FFF', fontSize: 12, fontWeight: '600', marginLeft: 5 },
  coordinatesBox: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, marginTop: 8 },
  coordinatesText: { fontSize: 12, marginLeft: 6 },
  timeLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  timePickerButton: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginHorizontal: 5 },
  timePickerLabel: { fontSize: 11 },
  timePickerValue: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  submitButton: { marginHorizontal: 20, marginBottom: 40, borderRadius: 15, paddingVertical: 18, alignItems: 'center' },
  submitButtonText: { fontSize: 18, fontWeight: 'bold' },
});
