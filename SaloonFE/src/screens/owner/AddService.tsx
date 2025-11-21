import React, { useState, useEffect } from "react";
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
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { salonAPI, serviceAPI } from "../../services/api";
import imageService from "../../services/imageService";
import { fonts } from "../../config/fonts";

export default function AddService() {
  const navigation = useNavigation();
  const route = useRoute();
  const isDark = useColorScheme() === "dark";

  const { salon: preSelectedSalon } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [salons, setSalons] = useState([]);
  const [showSalonModal, setShowSalonModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [formData, setFormData] = useState({
    salon: preSelectedSalon?.id || "",
    name: "",
    description: "",
    price: "",
    duration: "30",
    image: "",
  });

  const theme = isDark
    ? {
        bg: "#000000",
        card: "#1A1A1A",
        text: "#C0C0C0",
        primary: "#C0C0C0",
        inputBg: "#0D0D0D",
        border: "#333333",
      }
    : {
        bg: "#F5F5F5",
        card: "#FFFFFF",
        text: "#000000",
        primary: "#000000",
        inputBg: "#FAFAFA",
        border: "#E0E0E0",
      };

  const durationOptions = [];
  for (let i = 5; i <= 120; i += 5) {
    const hours = Math.floor(i / 60);
    const minutes = i % 60;
    const label = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
    durationOptions.push({ label, value: i.toString(), minutes: i });
  }

  useEffect(() => {
    if (!preSelectedSalon) {
      fetchSalons();
    }
  }, []);

  const fetchSalons = async () => {
    try {
      const response = await salonAPI.getAll();
      setSalons(response.data);
    } catch (error) {
      console.error("Error fetching salons:", error);
      Alert.alert("Error", "Failed to load salons");
    }
  };

  const handleUploadImage = async () => {
    setUploadingImage(true);
    try {
      const uris = await imageService.showImagePickerOptions(false);
      if (uris && uris.length > 0) {
        const url = await imageService.uploadToCloudinary(uris[0], "services");
        if (url) {
          setFormData({ ...formData, image: url });
          Alert.alert("Success", "Image uploaded!");
        }
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const formatDurationDisplay = (minutes: string) => {
    const mins = parseInt(minutes);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${String(hours).padStart(2, "0")}:${String(remainingMins).padStart(
      2,
      "0"
    )}`;
  };

  const getSelectedSalonName = () => {
    if (preSelectedSalon) return preSelectedSalon.name;
    const selectedSalon = salons.find((s: any) => s.id === formData.salon);
    return selectedSalon ? selectedSalon.name : "Select Salon";
  };

  const handleSelectSalon = (salonId: number) => {
    setFormData({ ...formData, salon: salonId });
    setShowSalonModal(false);
  };

  const handleSelectDuration = (value: string) => {
    setFormData({ ...formData, duration: value });
    setShowDurationModal(false);
  };

  const handleAddService = async () => {
    if (
      !formData.salon ||
      !formData.name ||
      !formData.price ||
      !formData.duration
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await serviceAPI.create(formData);
      Alert.alert("Success", "Service added successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error("Add service error:", error.response?.data);
      Alert.alert("Error", "Failed to add service");
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Add Service
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Service Image
          </Text>
          {formData.image ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: formData.image }}
                style={styles.serviceImage}
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={handleUploadImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="camera" size={18} color="#FFF" />
                    <Text style={styles.changeImageText}>Change</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.uploadButton,
                { backgroundColor: theme.inputBg, borderColor: theme.border },
              ]}
              onPress={handleUploadImage}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <>
                  <Ionicons name="image" size={40} color={theme.primary} />
                  <Text style={[styles.uploadText, { color: theme.text }]}>
                    Upload Service Image
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.card }]}>
          {/* Salon Selection */}
          {preSelectedSalon ? (
            <View
              style={[
                styles.salonInfoBox,
                { backgroundColor: theme.inputBg, borderColor: theme.border },
              ]}
            >
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={[
                    styles.salonInfoLabel,
                    { color: theme.text, opacity: 0.6 },
                  ]}
                >
                  Adding service to:
                </Text>
                <Text style={[styles.salonInfoName, { color: theme.text }]}>
                  {preSelectedSalon.name}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.salonSection}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Salon *
              </Text>
              <TouchableOpacity
                style={[
                  styles.selectorButton,
                  { backgroundColor: theme.inputBg, borderColor: theme.border },
                ]}
                onPress={() => setShowSalonModal(true)}
              >
                <Ionicons
                  name="storefront-outline"
                  size={20}
                  color={theme.text}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={[
                      styles.selectorButtonLabel,
                      { color: theme.text, opacity: 0.6 },
                    ]}
                  >
                    Select Salon
                  </Text>
                  <Text
                    style={[styles.selectorButtonValue, { color: theme.text }]}
                  >
                    {getSelectedSalonName()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
          )}

          <View
            style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}
          >
            <Ionicons
              name="cut-outline"
              size={20}
              color={theme.text}
              style={styles.icon}
            />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Service Name *"
              placeholderTextColor={theme.text + "70"}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View
            style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}
          >
            <Ionicons
              name="document-text-outline"
              size={20}
              color={theme.text}
              style={styles.icon}
            />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Description"
              placeholderTextColor={theme.text + "70"}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
            />
          </View>

          <View
            style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}
          >
            <Ionicons
              name="cash-outline"
              size={20}
              color={theme.text}
              style={styles.icon}
            />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Price (₹) *"
              placeholderTextColor={theme.text + "70"}
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              keyboardType="numeric"
            />
          </View>

          {/* Duration Picker */}
          <View style={styles.durationSection}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>
              Duration *
            </Text>
            <TouchableOpacity
              style={[
                styles.selectorButton,
                { backgroundColor: theme.inputBg, borderColor: theme.border },
              ]}
              onPress={() => setShowDurationModal(true)}
            >
              <Ionicons name="time-outline" size={20} color={theme.text} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={[
                    styles.selectorButtonLabel,
                    { color: theme.text, opacity: 0.6 },
                  ]}
                >
                  Service Duration
                </Text>
                <Text
                  style={[styles.selectorButtonValue, { color: theme.text }]}
                >
                  {formatDurationDisplay(formData.duration)} (
                  {formData.duration} minutes)
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 },
          ]}
          onPress={handleAddService}
          disabled={loading}
        >
          <Text
            style={[
              styles.submitButtonText,
              { color: isDark ? "#000" : "#FFF" },
            ]}
          >
            {loading ? "Adding Service..." : "Add Service"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Salon Selection Modal */}
      <Modal
        visible={showSalonModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSalonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Select Salon
              </Text>
              <TouchableOpacity onPress={() => setShowSalonModal(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={salons}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor:
                        formData.salon === item.id
                          ? theme.primary + "20"
                          : "transparent",
                    },
                  ]}
                  onPress={() => handleSelectSalon(item.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.modalOptionTitle, { color: theme.text }]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.modalOptionSubtitle,
                        { color: theme.text, opacity: 0.6 },
                      ]}
                    >
                      {item.address}
                    </Text>
                  </View>
                  {formData.salon === item.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Duration Selection Modal */}
      <Modal
        visible={showDurationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDurationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Select Duration
              </Text>
              <TouchableOpacity onPress={() => setShowDurationModal(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={durationOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor:
                        formData.duration === item.value
                          ? theme.primary + "20"
                          : "transparent",
                    },
                  ]}
                  onPress={() => handleSelectDuration(item.value)}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.modalOptionTitle, { color: theme.text }]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.modalOptionSubtitle,
                        { color: theme.text, opacity: 0.6 },
                      ]}
                    >
                      {item.minutes} minutes
                    </Text>
                  </View>
                  {formData.duration === item.value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.heading.bold,
    flex: 1,
    textAlign: "center",
  },
  content: { flex: 1 },
  section: { margin: 20, padding: 20, borderRadius: 20 },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.heading.bold,
    marginBottom: 15,
  },
  imageContainer: { position: "relative" },
  serviceImage: { width: "100%", height: 180, borderRadius: 15 },
  changeImageButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeImageText: {
    color: "#FFF",
    marginLeft: 6,
    fontSize: 13,
    fontFamily: fonts.body.semiBold,
  },
  uploadButton: {
    height: 180,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
  },
  uploadText: { fontSize: 14, marginTop: 10, fontFamily: fonts.body.semiBold },
  formCard: { margin: 20, padding: 20, borderRadius: 20 },
  salonInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
  },
  salonInfoLabel: { fontSize: 12, fontFamily: fonts.body.regular },
  salonInfoName: { fontSize: 16, fontFamily: fonts.heading.bold, marginTop: 2 },
  salonSection: { marginBottom: 15 },
  durationSection: { marginBottom: 15 },
  fieldLabel: {
    fontSize: 14,
    fontFamily: fonts.body.semiBold,
    marginBottom: 8,
  },
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorButtonLabel: { fontSize: 11, fontFamily: fonts.body.regular },
  selectorButtonValue: {
    fontSize: 16,
    fontFamily: fonts.body.semiBold,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    minHeight: 55,
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    fontFamily: fonts.body.regular,
  },
  submitButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: "center",
  },
  submitButtonText: { fontSize: 18, fontFamily: fonts.heading.bold },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "70%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: { fontSize: 20, fontFamily: fonts.heading.bold },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  modalOptionTitle: { fontSize: 18, fontFamily: fonts.body.semiBold },
  modalOptionSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: fonts.body.regular,
  },
});
