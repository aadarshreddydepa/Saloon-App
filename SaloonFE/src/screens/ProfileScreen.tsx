import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Image,
  Alert,
  TextInput,
  Modal,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import imageService from '../services/imageService';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === 'dark';
  const { user, setUser, logout } = useAuthStore();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    profile_picture: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const theme = isDark 
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', border: '#333333', inputBg: '#0D0D0D' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', border: '#E0E0E0', inputBg: '#FAFAFA' };

  useEffect(() => {
    if (user) {
      setEditData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        profile_picture: user.profile_picture || '',
      });
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      '👋 Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
          },
        },
      ]
    );
  };

  const handleUploadProfilePicture = async () => {
    setUploadingPhoto(true);
    try {
      const uris = await imageService.showImagePickerOptions(false);
      if (uris && uris.length > 0) {
        const url = await imageService.uploadToCloudinary(uris[0], 'profiles');
        if (url) {
          // Update local state
          setEditData({ ...editData, profile_picture: url });
          
          // Update backend
          const response = await authAPI.updateProfile({ profile_picture: url });
          setUser(response.data);
          
          Alert.alert('✅ Success', 'Profile picture updated!');
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('❌ Error', error.response?.data?.detail || 'Failed to upload profile picture');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async () => {
    // Validation
    if (!editData.first_name.trim()) {
      Alert.alert('❌ Error', 'First name is required');
      return;
    }
    
    if (!editData.email.trim()) {
      Alert.alert('❌ Error', 'Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editData.email)) {
      Alert.alert('❌ Error', 'Please enter a valid email address');
      return;
    }

    setUpdatingProfile(true);
    try {
      // Only send fields that have values
      const updateData: any = {
        first_name: editData.first_name.trim(),
        last_name: editData.last_name.trim(),
        email: editData.email.trim(),
      };

      if (editData.phone.trim()) {
        updateData.phone = editData.phone.trim();
      }

      if (editData.profile_picture) {
        updateData.profile_picture = editData.profile_picture;
      }

      const response = await authAPI.updateProfile(updateData);
      
      // Update global state
      setUser(response.data);
      
      Alert.alert('✅ Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => setEditModalVisible(false) }
      ]);
    } catch (error: any) {
      console.error('Update error:', error.response?.data);
      Alert.alert(
        '❌ Error', 
        error.response?.data?.detail || 
        error.response?.data?.email?.[0] || 
        'Failed to update profile. Please try again.'
      );
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      Alert.alert('❌ Error', 'Current password is required');
      return;
    }
    
    if (!passwordData.newPassword) {
      Alert.alert('❌ Error', 'New password is required');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('❌ Error', 'New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      Alert.alert('❌ Error', 'Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      // Call your password change API endpoint here
      await authAPI.changePassword({
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      
      Alert.alert('✅ Success', 'Password changed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setPasswordModalVisible(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          }
        }
      ]);
    } catch (error: any) {
      console.error('Password change error:', error.response?.data);
      Alert.alert(
        '❌ Error',
        error.response?.data?.detail || 
        error.response?.data?.old_password?.[0] ||
        'Failed to change password. Please check your current password.'
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const getUserTypeIcon = () => {
    switch (user?.user_type) {
      case 'owner': return 'business';
      case 'barber': return 'cut';
      default: return 'person';
    }
  };

  const getUserTypeBadge = () => {
    const badges: any = {
      customer: { label: 'Customer', color: '#2196F3', icon: 'person' },
      owner: { label: 'Salon Owner', color: '#4CAF50', icon: 'business' },
      barber: { label: 'Barber', color: '#FF9800', icon: 'cut' },
    };
    return badges[user?.user_type || 'customer'];
  };

  const MenuSection = ({ title, items }: any) => (
    <View style={styles.menuSection}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      <View style={[styles.menuCard, { backgroundColor: theme.card }]}>
        {items.map((item: any, index: number) => (
          <View key={index}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={item.onPress}
              disabled={item.disabled}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={[styles.menuText, { color: theme.text }]}>{item.label}</Text>
              {item.rightElement || <Ionicons name="chevron-forward" size={20} color={theme.text + '50'} />}
            </TouchableOpacity>
            {index < items.length - 1 && (
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const accountItems = [
    {
      icon: 'person-outline',
      label: 'Edit Profile',
      color: '#2196F3',
      onPress: () => setEditModalVisible(true),
    },
    {
      icon: 'lock-closed-outline',
      label: 'Change Password',
      color: '#FF9800',
      onPress: () => setPasswordModalVisible(true),
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      color: '#9C27B0',
      disabled: true,
      rightElement: (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: theme.border, true: '#9C27B0' + '50' }}
          thumbColor={notificationsEnabled ? '#9C27B0' : '#f4f3f4'}
        />
      ),
    },
  ];

  const appItems = [
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      color: '#4CAF50',
      onPress: () => Alert.alert('📞 Help & Support', 'Contact us at:\n\n📧 aadarshreddydepa@gmail.com\n📱 +91 9381597991'),
    },
    {
      icon: 'information-circle-outline',
      label: 'About',
      color: '#2196F3',
      onPress: () => Alert.alert('ℹ️ About', 'Salon Booking App\nVersion 1.0.0\n\n© 2025 Salon Booking\nAll rights reserved'),
    },
  ];

  const badge = getUserTypeBadge();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Compact Header */}
      <View style={[styles.header, { backgroundColor: theme.bg }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enhanced Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: theme.card }]}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleUploadProfilePicture}
            disabled={uploadingPhoto}
          >
            {uploadingPhoto ? (
              <View style={[styles.avatar, { backgroundColor: theme.inputBg, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            ) : editData.profile_picture ? (
              <>
                <Image source={{ uri: editData.profile_picture }} style={styles.avatar} />
                <View style={[styles.cameraIconOverlay, { backgroundColor: badge.color }]}>
                  <Ionicons name="camera" size={18} color="#FFF" />
                </View>
              </>
            ) : (
              <>
                <View style={[styles.avatar, { backgroundColor: badge.color + '20', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name={getUserTypeIcon()} size={50} color={badge.color} />
                </View>
                <View style={[styles.cameraIconOverlay, { backgroundColor: badge.color }]}>
                  <Ionicons name="camera" size={18} color="#FFF" />
                </View>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={[styles.name, { color: theme.text }]}>
            {user?.first_name || user?.username} {user?.last_name || ''}
          </Text>
          
          <Text style={[styles.email, { color: theme.text }]}>{user?.email}</Text>
          
          <View style={[styles.badge, { backgroundColor: badge.color + '15' }]}>
            <Ionicons name={badge.icon} size={14} color={badge.color} />
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
          
          {user?.phone && (
            <View style={styles.phoneRow}>
              <Ionicons name="call" size={14} color={theme.text + '80'} />
              <Text style={[styles.phoneText, { color: theme.text }]}>{user.phone}</Text>
            </View>
          )}
        </View>

        {/* Account Settings */}
        <MenuSection title="Account Settings" items={accountItems} />

        {/* App Information */}
        <MenuSection title="App Information" items={appItems} />

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <View style={styles.logoutIconContainer}>
            <Ionicons name="log-out-outline" size={22} color="#F44336" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color="#F44336" />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>✏️ Edit Profile</Text>
              <TouchableOpacity onPress={() => !updatingProfile && setEditModalVisible(false)}>
                <Ionicons name="close-circle" size={32} color={theme.text + '80'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Profile Picture */}
              <TouchableOpacity 
                style={styles.modalAvatarContainer}
                onPress={handleUploadProfilePicture}
                disabled={uploadingPhoto || updatingProfile}
              >
                {uploadingPhoto ? (
                  <View style={[styles.modalAvatar, { backgroundColor: theme.inputBg, justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                  </View>
                ) : editData.profile_picture ? (
                  <>
                    <Image source={{ uri: editData.profile_picture }} style={styles.modalAvatar} />
                    <View style={[styles.modalCameraIcon, { backgroundColor: badge.color }]}>
                      <Ionicons name="camera" size={16} color="#FFF" />
                    </View>
                  </>
                ) : (
                  <View style={[styles.modalAvatar, { backgroundColor: theme.inputBg, justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="person" size={40} color={theme.text} />
                    <View style={[styles.modalCameraIcon, { backgroundColor: badge.color }]}>
                      <Ionicons name="camera" size={16} color="#FFF" />
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={[styles.inputLabel, { color: theme.text }]}>First Name *</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Ionicons name="person-outline" size={20} color={theme.text + '80'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter first name"
                  placeholderTextColor={theme.text + '50'}
                  value={editData.first_name}
                  onChangeText={(text) => setEditData({ ...editData, first_name: text })}
                  editable={!updatingProfile}
                />
              </View>

              <Text style={[styles.inputLabel, { color: theme.text }]}>Last Name</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Ionicons name="person-outline" size={20} color={theme.text + '80'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter last name"
                  placeholderTextColor={theme.text + '50'}
                  value={editData.last_name}
                  onChangeText={(text) => setEditData({ ...editData, last_name: text })}
                  editable={!updatingProfile}
                />
              </View>

              <Text style={[styles.inputLabel, { color: theme.text }]}>Email *</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Ionicons name="mail-outline" size={20} color={theme.text + '80'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter email"
                  placeholderTextColor={theme.text + '50'}
                  value={editData.email}
                  onChangeText={(text) => setEditData({ ...editData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!updatingProfile}
                />
              </View>

              <Text style={[styles.inputLabel, { color: theme.text }]}>Phone Number</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Ionicons name="call-outline" size={20} color={theme.text + '80'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter phone number"
                  placeholderTextColor={theme.text + '50'}
                  value={editData.phone}
                  onChangeText={(text) => setEditData({ ...editData, phone: text })}
                  keyboardType="phone-pad"
                  editable={!updatingProfile}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: badge.color }]}
                onPress={handleUpdateProfile}
                disabled={updatingProfile}
              >
                {updatingProfile ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={passwordModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>🔒 Change Password</Text>
              <TouchableOpacity onPress={() => !changingPassword && setPasswordModalVisible(false)}>
                <Ionicons name="close-circle" size={32} color={theme.text + '80'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Current Password *</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.text + '80'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter current password"
                  placeholderTextColor={theme.text + '50'}
                  value={passwordData.currentPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                  secureTextEntry
                  editable={!changingPassword}
                />
              </View>

              <Text style={[styles.inputLabel, { color: theme.text }]}>New Password *</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.text + '80'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter new password (min 6 chars)"
                  placeholderTextColor={theme.text + '50'}
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                  secureTextEntry
                  editable={!changingPassword}
                />
              </View>

              <Text style={[styles.inputLabel, { color: theme.text }]}>Confirm New Password *</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.text + '80'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Re-enter new password"
                  placeholderTextColor={theme.text + '50'}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                  secureTextEntry
                  editable={!changingPassword}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: '#FF9800' }]}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={22} color="#FFF" />
                    <Text style={styles.saveButtonText}>Update Password</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  profileHeader: { 
    padding: 24, 
    alignItems: 'center', 
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 20,
  },
  avatarContainer: { 
    marginBottom: 16, 
    position: 'relative',
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50,
  },
  cameraIconOverlay: { 
    position: 'absolute', 
    bottom: 2, 
    right: 2, 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 3, 
    borderColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  email: { fontSize: 14, marginBottom: 12, opacity: 0.7 },
  badge: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14, 
    paddingVertical: 6, 
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: { fontSize: 13, fontWeight: '600' },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 13,
    opacity: 0.7,
  },
  menuSection: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, opacity: 0.7 },
  menuCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16,
  },
  menuIconContainer: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 14,
  },
  menuText: { flex: 1, fontSize: 15, fontWeight: '500' },
  divider: {
    height: 1,
    marginLeft: 70,
    opacity: 0.5,
  },
  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    marginHorizontal: 20, 
    marginTop: 8,
    borderRadius: 16, 
    borderWidth: 1.5,
    borderColor: '#F4433620',
    backgroundColor: '#F4433610',
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4433615',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  logoutText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#F44336' },
  
  // Modal Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'flex-end',
  },
  modalContent: { 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    padding: 20, 
    maxHeight: '85%',
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#33333320',
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold' },
  modalAvatarContainer: { 
    alignSelf: 'center', 
    marginBottom: 24,
    position: 'relative',
  },
  modalAvatar: { 
    width: 90, 
    height: 90, 
    borderRadius: 45,
  },
  modalCameraIcon: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 3, 
    borderColor: '#FFF',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    opacity: 0.8,
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 12, 
    paddingHorizontal: 14, 
    marginBottom: 16, 
    height: 52,
    borderWidth: 1,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, paddingVertical: 8 },
  saveButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14, 
    paddingVertical: 16, 
    marginTop: 8, 
    marginBottom: 20,
  },
  saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
});
