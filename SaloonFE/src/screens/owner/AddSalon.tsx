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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { salonAPI } from '../../services/api';
import imageService from '../../services/imageService';
import ImageGallery from '../../components/ImageGallery';

export default function AddSalon() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
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
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', inputBg: '#0D0D0D' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', inputBg: '#FAFAFA' };

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

  const handleAddSalon = async () => {
    if (!formData.name || !formData.address || !formData.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
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
        {/* Cover Image Section */}
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

        {/* Gallery Section */}
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

        {/* Rest of the form fields... */}
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
            />
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

          <View style={styles.timeRow}>
            <View style={[styles.timeInput, { backgroundColor: theme.inputBg }]}>
              <Ionicons name="time-outline" size={20} color={theme.text} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Opening Time"
                placeholderTextColor={theme.text + '70'}
                value={formData.opening_time}
                onChangeText={(text) => setFormData({ ...formData, opening_time: text })}
              />
            </View>
            <View style={[styles.timeInput, { backgroundColor: theme.inputBg }]}>
              <Ionicons name="time-outline" size={20} color={theme.text} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Closing Time"
                placeholderTextColor={theme.text + '70'}
                value={formData.closing_time}
                onChangeText={(text) => setFormData({ ...formData, closing_time: text })}
              />
            </View>
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
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeInput: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingHorizontal: 15, marginRight: 10, height: 55 },
  submitButton: { marginHorizontal: 20, marginBottom: 40, borderRadius: 15, paddingVertical: 18, alignItems: 'center' },
  submitButtonText: { fontSize: 18, fontWeight: 'bold' },
});
