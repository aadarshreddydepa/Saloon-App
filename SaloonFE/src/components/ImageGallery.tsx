import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface ImageGalleryProps {
  images: string[];
  onDelete?: (index: number) => void;
  editable?: boolean;
}

export default function ImageGallery({ images, onDelete, editable = false }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isDark = useColorScheme() === 'dark';

  const theme = isDark
    ? { bg: '#000000', card: '#1A1A1A' }
    : { bg: '#F5F5F5', card: '#FFFFFF' };

  const handleImagePress = (image: string, index: number) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(selectedIndex);
      setSelectedImage(null);
    }
  };

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gallery}
      >
        {images.map((image, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleImagePress(image, index)}
            style={styles.imageContainer}
          >
            <Image source={{ uri: image }} style={styles.thumbnail} />
            {editable && onDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onDelete(index)}
              >
                <Ionicons name="close-circle" size={24} color="#F44336" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={32} color="#FFF" />
          </TouchableOpacity>

          {editable && onDelete && (
            <TouchableOpacity style={styles.modalDeleteButton} onPress={handleDelete}>
              <Ionicons name="trash" size={28} color="#F44336" />
            </TouchableOpacity>
          )}

          <Image
            source={{ uri: selectedImage || '' }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  gallery: {
    paddingVertical: 10,
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  thumbnail: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  modalDeleteButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  fullImage: {
    width: width,
    height: height * 0.8,
  },
});
