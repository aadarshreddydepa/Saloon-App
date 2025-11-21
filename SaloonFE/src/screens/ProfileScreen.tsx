import React, { useState, useEffect } from "react";
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
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  RefreshControl,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { authAPI } from "../services/api";
import imageService from "../services/imageService";
import Toast from "../components/Toast";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { hapticFeedback } from "../utils/haptics";
import { fonts } from "../config/fonts";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const { user, setUser, logout } = useAuthStore();

  // Modal States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // UI States
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Toast State
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  // Password Visibility States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    profile_picture: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Modern Theme Palette
  const theme = isDark
    ? {
        bg: "#000000",
        surface: "#1C1C1E",
        surfaceHighlight: "#2C2C2E",
        text: "#FFFFFF",
        textSecondary: "#8E8E93",
        primary: "#0A84FF",
        accent: "#30D158",
        danger: "#FF453A",
        border: "#38383A",
        inputBg: "#2C2C2E",
        shadow: "#000000",
      }
    : {
        bg: "#F2F2F7",
        surface: "#FFFFFF",
        surfaceHighlight: "#F9F9F9",
        text: "#000000",
        textSecondary: "#8E8E93",
        primary: "#007AFF",
        accent: "#34C759",
        danger: "#FF3B30",
        border: "#E5E5EA",
        inputBg: "#F2F2F7",
        shadow: "#000000",
      };

  useEffect(() => {
    if (user) {
      setEditData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        profile_picture: user.profile_picture || "",
      });
    }
  }, [user]);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ visible: true, message, type });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    hapticFeedback.light();
    // Simulate refresh - in real app, fetch latest user data
    setTimeout(() => {
      setRefreshing(false);
      showToast("Profile refreshed", "success");
    }, 1000);
  };

  const handleLogout = () => {
    hapticFeedback.warning();
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => hapticFeedback.light(),
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          hapticFeedback.success();
          await logout();
          navigation.reset({ index: 0, routes: [{ name: "Login" as never }] });
        },
      },
    ]);
  };

  const handleUploadProfilePicture = async () => {
    try {
      hapticFeedback.light();
      setUploadingPhoto(true);
      const uris = await imageService.showImagePickerOptions(false);

      if (!uris || uris.length === 0) {
        setUploadingPhoto(false);
        return;
      }

      const url = await imageService.uploadToCloudinary(uris[0], "profiles");
      if (url) {
        setEditData({ ...editData, profile_picture: url });
        const response = await authAPI.updateProfile({ profile_picture: url });
        setUser(response.data);
        hapticFeedback.success();
        showToast("Profile picture updated", "success");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      hapticFeedback.error();
      showToast(
        error.response?.data?.detail || "Failed to upload profile picture",
        "error"
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editData.first_name.trim()) {
      hapticFeedback.warning();
      showToast("First name is required", "error");
      return;
    }

    if (!editData.email.trim()) {
      hapticFeedback.warning();
      showToast("Email is required", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editData.email)) {
      hapticFeedback.warning();
      showToast("Please enter a valid email address", "error");
      return;
    }

    setUpdatingProfile(true);
    try {
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
      setUser(response.data);

      hapticFeedback.success();
      showToast("Profile updated successfully", "success");
      setEditModalVisible(false);
    } catch (error: any) {
      hapticFeedback.error();
      showToast(
        error.response?.data?.detail ||
          error.response?.data?.email?.[0] ||
          "Could not update profile. Please try again.",
        "error"
      );
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      hapticFeedback.warning();
      showToast("Please fill in all fields", "error");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      hapticFeedback.warning();
      showToast("New passwords do not match", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      hapticFeedback.warning();
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setChangingPassword(true);
    try {
      await authAPI.changePassword({
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      hapticFeedback.success();
      showToast("Password changed successfully", "success");
      setPasswordModalVisible(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      hapticFeedback.error();
      showToast(
        error.response?.data?.detail ||
          error.response?.data?.old_password?.[0] ||
          "Failed to change password. Please verify your current password.",
        "error"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const getUserTypeIcon = () => {
    switch (user?.user_type) {
      case "owner":
        return "business";
      case "barber":
        return "cut";
      default:
        return "person";
    }
  };

  const getUserTypeBadge = () => {
    const badges: any = {
      customer: { label: "Customer", color: theme.primary, icon: "person" },
      owner: { label: "Salon Owner", color: theme.accent, icon: "business" },
      barber: { label: "Barber", color: "#FF9500", icon: "cut" },
    };
    return badges[user?.user_type || "customer"];
  };

  const getProfileCompletion = () => {
    let completed = 0;
    const fields = [
      user?.first_name,
      user?.last_name,
      user?.email,
      user?.phone,
      user?.profile_picture,
    ];

    fields.forEach((field) => {
      if (field && field.trim()) completed++;
    });

    return Math.round((completed / fields.length) * 100);
  };

  const getInitials = () => {
    const firstName = user?.first_name || user?.username || "";
    const lastName = user?.last_name || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const MenuSection = ({ title, items }: any) => (
    <View style={styles.menuSection}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        {title}
      </Text>
      <View style={[styles.menuCard, { backgroundColor: theme.surface }]}>
        {items.map((item: any, index: number) => (
          <View key={index}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                hapticFeedback.light();
                item.onPress();
              }}
              disabled={item.disabled}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: item.color + "15" },
                ]}
              >
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={[styles.menuText, { color: theme.text }]}>
                {item.label}
              </Text>
              {item.rightElement || (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.textSecondary}
                />
              )}
            </TouchableOpacity>
            {index < items.length - 1 && (
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const accountItems = [
    {
      icon: "person",
      label: "Edit Profile",
      color: theme.primary,
      onPress: () => setEditModalVisible(true),
    },
    {
      icon: "lock-closed",
      label: "Change Password",
      color: "#FF9500",
      onPress: () => setPasswordModalVisible(true),
    },
    {
      icon: "notifications",
      label: "Notifications",
      color: "#AF52DE",
      disabled: true,
      rightElement: (
        <Switch
          value={notificationsEnabled}
          onValueChange={(value) => {
            hapticFeedback.selection();
            setNotificationsEnabled(value);
          }}
          trackColor={{ false: theme.border, true: "#AF52DE" }}
          thumbColor={"#FFFFFF"}
          ios_backgroundColor={theme.border}
        />
      ),
    },
  ];

  const appItems = [
    {
      icon: "help-buoy",
      label: "Help & Support",
      color: theme.accent,
      onPress: () => showToast("Contact: aadarshreddydepa@gmail.com", "info"),
    },
    {
      icon: "information-circle",
      label: "About",
      color: theme.primary,
      onPress: () => showToast("Salon Booking App v1.0.0", "info"),
    },
  ];

  const badge = getUserTypeBadge();
  const profileCompletion = getProfileCompletion();

  // Reusable Input Component for Modals
  const ModalInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
    isPassword,
    showPassword,
    onTogglePassword,
  }: any) => (
    <View style={[styles.inputRow, { borderBottomColor: theme.border }]}>
      <Text style={[styles.inputLabel, { color: theme.text }]}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.inputField, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => {
              hapticFeedback.light();
              onTogglePassword();
            }}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Profile
          </Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              onPress={handleUploadProfilePicture}
              disabled={uploadingPhoto}
              activeOpacity={0.8}
              style={[styles.avatarContainer, { borderColor: theme.bg }]}
            >
              {uploadingPhoto ? (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: theme.surfaceHighlight },
                  ]}
                >
                  <ActivityIndicator color={theme.primary} />
                </View>
              ) : editData.profile_picture ? (
                <Image
                  source={{ uri: editData.profile_picture }}
                  style={styles.avatar}
                />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: badge.color + "20" },
                  ]}
                >
                  <Text style={[styles.initialsText, { color: badge.color }]}>
                    {getInitials()}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.editBadge,
                  { backgroundColor: theme.primary, borderColor: theme.bg },
                ]}
              >
                <Ionicons name="camera" size={12} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.first_name} {user?.last_name}
            </Text>
            <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
              {user?.email}
            </Text>

            <View
              style={[
                styles.roleBadge,
                { backgroundColor: badge.color + "20" },
              ]}
            >
              <Text style={[styles.roleText, { color: badge.color }]}>
                {badge.label}
              </Text>
            </View>

            {/* Profile Completion */}
            <View style={styles.completionContainer}>
              <View style={styles.completionHeader}>
                <Text
                  style={[
                    styles.completionLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  Profile Completion
                </Text>
                <Text
                  style={[styles.completionPercent, { color: theme.primary }]}
                >
                  {profileCompletion}%
                </Text>
              </View>
              <View
                style={[styles.progressBar, { backgroundColor: theme.border }]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${profileCompletion}%`,
                      backgroundColor:
                        profileCompletion === 100
                          ? theme.accent
                          : theme.primary,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        <MenuSection title="Account" items={accountItems} />
        <MenuSection title="Support" items={appItems} />

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: theme.surface }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={[styles.signOutText, { color: theme.danger }]}>
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: theme.textSecondary }]}>
          Version 1.0.0
        </Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.bg }]}>
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor: theme.surface,
                borderBottomColor: theme.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                hapticFeedback.light();
                setEditModalVisible(false);
              }}
            >
              <Text
                style={[styles.modalCancel, { color: theme.textSecondary }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Edit Profile
            </Text>
            <TouchableOpacity
              onPress={handleUpdateProfile}
              disabled={updatingProfile}
            >
              {updatingProfile ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Text style={[styles.modalDone, { color: theme.primary }]}>
                  Done
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView style={styles.modalContent}>
              <View
                style={[styles.formSection, { backgroundColor: theme.surface }]}
              >
                <ModalInput
                  label="First Name"
                  value={editData.first_name}
                  onChangeText={(t: string) =>
                    setEditData({ ...editData, first_name: t })
                  }
                  placeholder="First Name"
                />
                <ModalInput
                  label="Last Name"
                  value={editData.last_name}
                  onChangeText={(t: string) =>
                    setEditData({ ...editData, last_name: t })
                  }
                  placeholder="Last Name"
                />
              </View>

              <View
                style={[
                  styles.formSection,
                  { backgroundColor: theme.surface, marginTop: 24 },
                ]}
              >
                <ModalInput
                  label="Email"
                  value={editData.email}
                  onChangeText={(t: string) =>
                    setEditData({ ...editData, email: t })
                  }
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <ModalInput
                  label="Phone"
                  value={editData.phone}
                  onChangeText={(t: string) =>
                    setEditData({ ...editData, phone: t })
                  }
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.bg }]}>
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor: theme.surface,
                borderBottomColor: theme.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                hapticFeedback.light();
                setPasswordModalVisible(false);
              }}
            >
              <Text
                style={[styles.modalCancel, { color: theme.textSecondary }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Change Password
            </Text>
            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Text style={[styles.modalDone, { color: theme.primary }]}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView style={styles.modalContent}>
              <View
                style={[styles.formSection, { backgroundColor: theme.surface }]}
              >
                <ModalInput
                  label="Current"
                  value={passwordData.currentPassword}
                  onChangeText={(t: string) =>
                    setPasswordData({ ...passwordData, currentPassword: t })
                  }
                  placeholder="Current Password"
                  secureTextEntry={!showCurrentPassword}
                  isPassword
                  showPassword={showCurrentPassword}
                  onTogglePassword={() =>
                    setShowCurrentPassword(!showCurrentPassword)
                  }
                />

                <ModalInput
                  label="New"
                  value={passwordData.newPassword}
                  onChangeText={(t: string) =>
                    setPasswordData({ ...passwordData, newPassword: t })
                  }
                  placeholder="New Password"
                  secureTextEntry={!showNewPassword}
                  isPassword
                  showPassword={showNewPassword}
                  onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                />

                <ModalInput
                  label="Confirm"
                  value={passwordData.confirmPassword}
                  onChangeText={(t: string) =>
                    setPasswordData({ ...passwordData, confirmPassword: t })
                  }
                  placeholder="Confirm Password"
                  secureTextEntry={!showConfirmPassword}
                  isPassword
                  showPassword={showConfirmPassword}
                  onTogglePassword={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                />
              </View>

              <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
                <PasswordStrengthMeter
                  password={passwordData.newPassword}
                  isDark={isDark}
                />
              </View>

              <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                Password must be at least 6 characters long.
              </Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 60 : 60,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 34,
    fontFamily: fonts.heading.bold,
    letterSpacing: 0.3,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarWrapper: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    position: "relative",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    fontSize: 32,
    fontFamily: fonts.heading.bold,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
  },
  profileInfo: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  userName: {
    fontSize: 22,
    fontFamily: fonts.heading.semiBold,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    fontFamily: fonts.body.regular,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 16,
  },
  roleText: {
    fontSize: 13,
    fontFamily: fonts.body.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  completionContainer: {
    width: "100%",
    marginTop: 8,
  },
  completionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  completionLabel: {
    fontSize: 13,
    fontFamily: fonts.body.semiBold,
  },
  completionPercent: {
    fontSize: 13,
    fontFamily: fonts.body.bold,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: fonts.body.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 16,
  },
  menuCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    height: 56,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 17,
    fontFamily: fonts.body.regular,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 64,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  signOutText: {
    fontSize: 17,
    fontFamily: fonts.body.semiBold,
  },
  versionText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 13,
    fontFamily: fonts.body.regular,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: fonts.heading.semiBold,
  },
  modalCancel: {
    fontSize: 17,
    fontFamily: fonts.body.regular,
  },
  modalDone: {
    fontSize: 17,
    fontFamily: fonts.body.semiBold,
  },
  modalContent: {
    flex: 1,
    paddingTop: 24,
  },
  formSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.1)",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inputLabel: {
    width: 100,
    fontSize: 17,
    fontFamily: fonts.body.regular,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
  },
  inputField: {
    flex: 1,
    fontSize: 17,
    fontFamily: fonts.body.regular,
    height: "100%",
  },
  eyeIcon: {
    padding: 8,
    marginRight: -8,
  },
  helperText: {
    padding: 16,
    fontSize: 13,
    fontFamily: fonts.body.regular,
  },
});
