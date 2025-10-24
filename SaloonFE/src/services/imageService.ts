import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert, Platform } from 'react-native';

class ImageService {
  /**
   * Request camera permissions
   */
  async requestCameraPermission(): Promise<boolean> {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is needed to take photos.'
        );
        return false;
      }
    }
    return true;
  }

  /**
   * Request media library permissions
   */
  async requestMediaLibraryPermission(): Promise<boolean> {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Photo library permission is needed to select images.'
        );
        return false;
      }
    }
    return true;
  }

  /**
   * Pick image from gallery
   */
  async pickImageFromGallery(options?: {
    allowsMultipleSelection?: boolean;
    quality?: number;
  }): Promise<string[] | null> {
    const hasPermission = await this.requestMediaLibraryPermission();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ Fixed: Use correct enum
        allowsMultipleSelection: options?.allowsMultipleSelection || false,
        quality: options?.quality || 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled) {
        return result.assets.map(asset => asset.uri);
      }
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
      return null;
    }
  }

  /**
   * Take photo with camera
   */
  async takePhoto(options?: { quality?: number }): Promise<string | null> {
    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ Fixed
        quality: options?.quality || 0.8,
        aspect: [4, 3],
        allowsEditing: true,
      });

      if (!result.canceled) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
      return null;
    }
  }

  /**
   * Compress and resize image
   */
  async compressImage(
    uri: string,
    options?: {
      width?: number;
      quality?: number;
    }
  ): Promise<string> {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: options?.width || 1024 } }],
        {
          compress: options?.quality || 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri;
    }
  }

  /**
   * Upload image to Cloudinary (FIXED VERSION)
   */
  async uploadToCloudinary(uri: string, folder: string = 'salons'): Promise<string | null> {
    try {
      console.log('📤 Starting upload to Cloudinary...');
      console.log('URI:', uri);
      
      // Compress image first
      const compressedUri = await this.compressImage(uri, { width: 1024, quality: 0.8 });
      console.log('✅ Image compressed');

      // ⚠️ IMPORTANT: Replace with YOUR Cloudinary cloud name
      const CLOUDINARY_CLOUD_NAME = 'dcajyslvv'; // 👈 CHANGE THIS!
      const CLOUDINARY_UPLOAD_PRESET = 'salon_app'; // 👈 Create this in Cloudinary
      
      if (CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
        Alert.alert(
          '⚠️ Setup Required',
          'Please configure Cloudinary:\n\n1. Sign up at cloudinary.com\n2. Get your Cloud Name\n3. Create upload preset "salon_app"\n4. Update imageService.ts'
        );
        return null;
      }

      // Create form data
      const formData = new FormData();
      
      // Get file info
      const uriParts = compressedUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      // ✅ FIXED: Proper file format for React Native
      formData.append('file', {
        uri: compressedUri,
        type: `image/${fileType}`,
        name: `photo.${fileType}`,
      } as any);

      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', folder);

      console.log('📤 Uploading to Cloudinary...');

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data = await response.json();
      
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (data.error) {
        console.error('❌ Cloudinary error:', data.error);
        throw new Error(data.error.message || 'Upload failed');
      }

      if (data.secure_url) {
        console.log('✅ Image uploaded successfully:', data.secure_url);
        return data.secure_url;
      }

      throw new Error('Upload failed - no URL returned');
    } catch (error: any) {
      console.error('❌ Error uploading to Cloudinary:', error);
      console.error('Error details:', error.message);
      
      Alert.alert(
        'Upload Error', 
        `Failed to upload image.\n\nError: ${error.message}\n\nPlease check:\n1. Cloudinary cloud name\n2. Upload preset exists\n3. Internet connection`
      );
      return null;
    }
  }

  /**
   * Show image picker options (Camera or Gallery)
   */
  async showImagePickerOptions(multiple: boolean = false): Promise<string[] | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Image',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              const uri = await this.takePhoto();
              resolve(uri ? [uri] : null);
            },
          },
          {
            text: 'Choose from Library',
            onPress: async () => {
              const uris = await this.pickImageFromGallery({
                allowsMultipleSelection: multiple,
              });
              resolve(uris);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ],
        { cancelable: true }
      );
    });
  }
}

export default new ImageService();
