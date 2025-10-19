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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === 'dark';
  const { user, setUser, logout } = useAuthStore();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [editData, setEditData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const theme = isDark 
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', border: '#333333', inputBg: '#0D0D0D' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', border: '#E0E0E0', inputBg: '#FAFAFA' };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
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

  const handleUpdateProfile = async () => {
    try {
      const response = await authAPI.updateProfile(editData);
      setUser(response.data);
      Alert.alert('Success', 'Profile updated successfully');
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    
    Alert.alert('Success', 'Password changed successfully');
    setPasswordModalVisible(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const getUserTypeIcon = () => {
    switch (user?.user_type) {
      case 'owner':
        return 'business';
      case 'barber':
        return 'cut';
      default:
        return 'person';
    }
  };

  const getUserTypeBadge = () => {
    const badges: any = {
      customer: { label: 'Customer', color: '#2196F3' },
      owner: { label: 'Salon Owner', color: '#4CAF50' },
      barber: { label: 'Barber', color: '#FF9800' },
    };
    return badges[user?.user_type || 'customer'];
  };

  const MenuSection = ({ title, items }: any) => (
    <View style={styles.menuSection}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {items.map((item: any, index: number) => (
        <TouchableOpacity
          key={index}
          style={[styles.menuItem, { backgroundColor: theme.card }]}
          onPress={item.onPress}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={22} color={item.color} />
          </View>
          <Text style={[styles.menuText, { color: theme.text }]}>{item.label}</Text>
          {item.rightElement || <Ionicons name="chevron-forward" size={20} color={theme.text} />}
        </TouchableOpacity>
      ))}
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
      rightElement: (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: theme.border, true: theme.primary + '50' }}
          thumbColor={notificationsEnabled ? theme.primary : '#f4f3f4'}
        />
      ),
    },
  ];

  const appItems = [
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      color: '#4CAF50',
      onPress: () => Alert.alert('Help', 'Contact support at support@salonapp.com'),
    },
    {
      icon: 'information-circle-outline',
      label: 'About',
      color: '#2196F3',
      onPress: () => Alert.alert('Salon Booking App', 'Version 1.0.0\n\n© 2025 Salon Booking. All rights reserved.'),
    },
    {
      icon: 'document-text-outline',
      label: 'Terms & Conditions',
      color: '#9C27B0',
      onPress: () => Alert.alert('Terms', 'Terms and conditions content here'),
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Privacy Policy',
      color: '#FF9800',
      onPress: () => Alert.alert('Privacy', 'Privacy policy content here'),
    },
  ];

  const badge = getUserTypeBadge();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: theme.card }]}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.inputBg }]}>
            {user?.profile_picture ? (
              <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
            ) : (
              <Ionicons name={getUserTypeIcon()} size={50} color={theme.text} />
            )}
          </View>
          <Text style={[styles.name, { color: theme.text }]}>
            {user?.first_name || user?.username} {user?.last_name || ''}
          </Text>
          <Text style={[styles.email, { color: theme.text, opacity: 0.6 }]}>{user?.email}</Text>
          <View style={[styles.badge, { backgroundColor: badge.color + '20' }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>

        {/* Stats for Owner */}
        {user?.user_type === 'owner' && (
          <View style={[styles.statsContainer, { backgroundColor: theme.card }]}>
            <View style={styles.statItem}>
              <Ionicons name="storefront" size={24} color="#4CAF50" />
              <Text style={[styles.statValue, { color: theme.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.text, opacity: 0.6 }]}>Salons</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={24} color="#2196F3" />
              <Text style={[styles.statValue, { color: theme.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.text, opacity: 0.6 }]}>Bookings</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cash" size={24} color="#9C27B0" />
              <Text style={[styles.statValue, { color: theme.text }]}>₹0</Text>
              <Text style={[styles.statLabel, { color: theme.text, opacity: 0.6 }]}>Revenue</Text>
            </View>
          </View>
        )}

        {/* Account Settings */}
        <MenuSection title="Account" items={accountItems} />

        {/* App Settings */}
        <MenuSection title="App" items={appItems} />

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#F44336' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
                <Ionicons name="person-outline" size={20} color={theme.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="First Name"
                  placeholderTextColor={theme.text + '70'}
                  value={editData.first_name}
                  onChangeText={(text) => setEditData({ ...editData, first_name: text })}
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
                <Ionicons name="person-outline" size={20} color={theme.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Last Name"
                  placeholderTextColor={theme.text + '70'}
                  value={editData.last_name}
                  onChangeText={(text) => setEditData({ ...editData, last_name: text })}
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
                <Ionicons name="mail-outline" size={20} color={theme.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Email"
                  placeholderTextColor={theme.text + '70'}
                  value={editData.email}
                  onChangeText={(text) => setEditData({ ...editData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
                <Ionicons name="call-outline" size={20} color={theme.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Phone"
                  placeholderTextColor={theme.text + '70'}
                  value={editData.phone}
                  onChangeText={(text) => setEditData({ ...editData, phone: text })}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={handleUpdateProfile}
              >
                <Text style={[styles.saveButtonText, { color: isDark ? '#000' : '#FFF' }]}>
                  Save Changes
                </Text>
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
              <Text style={[styles.modalTitle, { color: theme.text }]}>Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Current Password"
                  placeholderTextColor={theme.text + '70'}
                  value={passwordData.currentPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                  secureTextEntry
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="New Password"
                  placeholderTextColor={theme.text + '70'}
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                  secureTextEntry
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Confirm New Password"
                  placeholderTextColor={theme.text + '70'}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={handleChangePassword}
              >
                <Text style={[styles.saveButtonText, { color: isDark ? '#000' : '#FFF' }]}>
                  Change Password
                </Text>
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
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  profileHeader: { padding: 30, alignItems: 'center', marginBottom: 20 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  email: { fontSize: 16, marginBottom: 12 },
  badge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 14, fontWeight: '600' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, marginHorizontal: 20, borderRadius: 20, marginBottom: 20 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  statLabel: { fontSize: 12, marginTop: 4 },
  menuSection: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 15, marginBottom: 10 },
  menuIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, marginHorizontal: 20, marginBottom: 40, borderRadius: 15 },
  logoutText: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingHorizontal: 15, marginBottom: 15, height: 55 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  saveButton: { borderRadius: 15, paddingVertical: 18, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  saveButtonText: { fontSize: 18, fontWeight: 'bold' },
});
