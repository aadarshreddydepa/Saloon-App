import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, View, Text, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import imageService from '../services/imageService';

interface ImageUploadButtonProps {
  onImageSelected: (url: string) => void;
  multiple?: boolean;
  folder?: string;
  children?: React.ReactNode;
  style?: any;
}

export default function ImageUploadButton({
  onImageSelected,
  multiple = false,
  folder = 'salons',
  children,
  style,
}: ImageUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const isDark = useColorScheme() === 'dark';

  const handleImagePick = async () => {
    setUploading(true);
    try {
      const uris = await imageService.showImagePickerOptions(multiple);
      
      if (uris && uris.length > 0) {
        // Upload first image (or all if multiple)
        const url = await imageService.uploadToCloudinary(uris[0], folder);
        if (url) {
          onImageSelected(url);
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleImagePick}
      disabled={uploading}
    >
      {uploading ? (
        <ActivityIndicator color={isDark ? '#C0C0C0' : '#000'} />
      ) : (
        children || (
          <View style={styles.defaultContent}>
            <Ionicons name="camera" size={24} color={isDark ? '#C0C0C0' : '#000'} />
            <Text style={[styles.text, { color: isDark ? '#C0C0C0' : '#000' }]}>
              Upload Image
            </Text>
          </View>
        )
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultContent: {
    alignItems: 'center',
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});
