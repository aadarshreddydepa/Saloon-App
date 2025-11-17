import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { salonAPI, serviceAPI } from "../../services/api";

export default function SalonDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const isDark = useColorScheme() === "dark";
  const [salon, setSalon] = useState<any>(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const salonId = (route.params as any)?.id;

  const theme = isDark
    ? {
        bg: "#000000",
        card: "#1A1A1A",
        text: "#C0C0C0",
        primary: "#C0C0C0",
        inputBg: "#0D0D0D",
      }
    : {
        bg: "#F5F5F5",
        card: "#FFFFFF",
        text: "#000000",
        primary: "#000000",
        inputBg: "#FAFAFA",
      };

  useEffect(() => {
    if (salonId) {
      fetchSalonDetails();
    }
  }, [salonId]);

  const fetchSalonDetails = async () => {
    try {
      const [salonRes, servicesRes] = await Promise.all([
        salonAPI.getById(salonId),
        serviceAPI.getBySalon(salonId),
      ]);
      setSalon(salonRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error("Error fetching salon details:", error);
      Alert.alert("Error", "Failed to load salon details");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSalonStatus = async () => {
    const newStatus = !salon.is_active;
    const action = newStatus ? "activate" : "deactivate";

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Salon`,
      `Are you sure you want to ${action} "${salon.name}"?\n\n${
        newStatus
          ? "✅ Salon will be visible to customers and accept bookings."
          : "⚠️ Salon will be hidden from customers and won't accept new bookings."
      }`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: newStatus ? "default" : "destructive",
          onPress: async () => {
            setToggling(true);
            try {
              await salonAPI.updatePartial(salonId, { is_active: newStatus });
              setSalon({ ...salon, is_active: newStatus });
              Alert.alert(
                "Success",
                `Salon ${newStatus ? "activated" : "deactivated"} successfully`,
                [{ text: "OK" }]
              );
            } catch (error: any) {
              console.error("Toggle error:", error.response?.data);
              Alert.alert(
                "Error",
                error.response?.data?.detail || "Failed to update salon status"
              );
            } finally {
              setToggling(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteSalon = () => {
    Alert.alert(
      "🗑️ Delete Salon",
      `Are you sure you want to permanently delete "${salon.name}"?\n\n⚠️ This will:\n• Remove all services\n• Cancel pending bookings\n• Remove barber assignments\n\nThis action CANNOT be undone!`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanently",
          style: "destructive",
          onPress: async () => {
            try {
              await salonAPI.delete(salonId);
              Alert.alert("Deleted", "Salon deleted successfully", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert("Error", "Failed to delete salon");
            }
          },
        },
      ]
    );
  };

  if (loading || !salon) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Salon Details
        </Text>
        <TouchableOpacity onPress={handleDeleteSalon}>
          <Ionicons name="trash-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchSalonDetails} />
        }
      >
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <View style={styles.infoHeader}>
            <Text style={[styles.salonName, { color: theme.text }]}>
              {salon.name}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: salon.is_active ? "#4CAF50" : "#F44336" },
              ]}
            >
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {salon.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          {!salon.is_active && (
            <View style={styles.warningBanner}>
              <Ionicons name="alert-circle" size={20} color="#FF9800" />
              <Text style={styles.warningText}>
                This salon is inactive and hidden from customers
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={theme.text} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              {salon.address}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color={theme.text} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              {salon.phone}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={theme.text} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              {salon.opening_time} - {salon.closing_time}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={[styles.infoText, { color: theme.text }]}>
              {salon.rating || "0.0"} ({salon.total_reviews || 0} reviews)
            </Text>
          </View>

          {salon.description && (
            <Text style={[styles.description, { color: theme.text }]}>
              {salon.description}
            </Text>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: salon.is_active ? "#FF9800" : "#4CAF50",
                opacity: toggling ? 0.6 : 1,
              },
            ]}
            onPress={handleToggleSalonStatus}


            disabled={toggling}
          >
            <Ionicons
              name={salon.is_active ? "pause-circle" : "play-circle"}
              size={24}
              color="#FFF"
            />
            <Text style={styles.actionButtonText}>
              {toggling
                ? "Updating..."
                : salon.is_active
                ? "Deactivate"
                : "Activate"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.barberManagementButton,
            { backgroundColor: theme.card },
          ]}
          onPress={() =>
            navigation.navigate("ManageBarbers" as never, { salonId: salon.id })
          }
        >
          <View style={[styles.barberIcon, { backgroundColor: "#9C27B020" }]}>
            <Ionicons name="people" size={28} color="#9C27B0" />
          </View>
          <View style={styles.barberInfo}>
            <Text style={[styles.barberTitle, { color: theme.text }]}>
              Manage Barbers
            </Text>
            <Text
              style={[
                styles.barberSubtitle,
                { color: theme.text, opacity: 0.6 },
              ]}
            >
              View barbers and approve join requests
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.servicesSection}>
          <View style={styles.servicesSectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Services ({services.length})
            </Text>
            <TouchableOpacity
              style={styles.addServiceButton}
              onPress={() => navigation.navigate("AddService", { salon: salon })}
            >
              <Ionicons name="add-circle" size={24} color="#FFF" />
              <Text style={styles.addServiceText}>Add</Text>
            </TouchableOpacity>
          </View>

          {services.length === 0 ? (
            <View
              style={[styles.emptyServices, { backgroundColor: theme.card }]}
            >
              <Ionicons
                name="list-outline"
                size={50}
                color={theme.text + "50"}
              />
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No services yet
              </Text>
              <Text
                style={[
                  styles.emptySubtext,
                  { color: theme.text, opacity: 0.6 },
                ]}
              >
                Add services to start accepting bookings
              </Text>
            </View>
          ) : (
            services.map((service: any) => (
              <View
                key={service.id}
                style={[styles.serviceCard, { backgroundColor: theme.card }]}
              >
                <View style={styles.serviceHeader}>
                  <Text style={[styles.serviceName, { color: theme.text }]}>
                    {service.name}
                  </Text>
                  <Text style={[styles.servicePrice, { color: "#4CAF50" }]}>
                    ₹{service.price}
                  </Text>
                </View>
                {service.description && (
                  <Text
                    style={[
                      styles.serviceDescription,
                      { color: theme.text, opacity: 0.6 },
                    ]}
                  >
                    {service.description}
                  </Text>
                )}
                <View style={styles.serviceFooter}>
                  <View style={styles.serviceDuration}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={theme.text}
                    />
                    <Text style={[styles.durationText, { color: theme.text }]}>
                      {service.duration} mins
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.serviceStatus,
                      {
                        backgroundColor: service.is_active
                          ? "#4CAF50"
                          : "#F44336",
                      },
                    ]}
                  >
                    <Text style={styles.serviceStatusText}>
                      {service.is_active ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  infoCard: { margin: 20, padding: 20, borderRadius: 20 },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  salonName: { fontSize: 24, fontWeight: "bold", flex: 1 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFF",
    marginRight: 6,
  },
  statusText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF980020",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  warningText: {
    color: "#FF9800",
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    fontWeight: "600",
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  infoText: { fontSize: 16, marginLeft: 12, flex: 1 },
  description: { fontSize: 14, marginTop: 12, lineHeight: 20 },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  barberManagementButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  barberIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  barberInfo: { flex: 1 },
  barberTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  barberSubtitle: { fontSize: 14 },
  servicesSection: { paddingHorizontal: 20, marginBottom: 20 },
  servicesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold" },
  addServiceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addServiceText: { color: "#FFF", fontSize: 14, fontWeight: "600", marginLeft: 6 },
  emptyServices: { padding: 40, borderRadius: 20, alignItems: "center" },
  emptyText: { fontSize: 18, fontWeight: "bold", marginTop: 15 },
  emptySubtext: { fontSize: 14, marginTop: 8, textAlign: "center" },
  serviceCard: { padding: 15, borderRadius: 15, marginBottom: 12 },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  serviceName: { fontSize: 16, fontWeight: "bold", flex: 1 },
  servicePrice: { fontSize: 16, fontWeight: "bold" },
  serviceDescription: { fontSize: 14, marginBottom: 10 },
  serviceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceDuration: { flexDirection: "row", alignItems: "center" },
  durationText: { fontSize: 14, marginLeft: 6 },
  serviceStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  serviceStatusText: { color: "#FFF", fontSize: 11, fontWeight: "600" },
});
