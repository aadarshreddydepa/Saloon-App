import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { salonAPI } from "../services/api";
import { fonts } from "../config/fonts";
import { AppNavigationProp } from "../types/navigation";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const isDark = useColorScheme() === "dark";

  const theme = isDark
    ? {
        bg: "#000000",
        card: "#1A1A1A",
        text: "#C0C0C0",
        primary: "#C0C0C0",
        border: "#333333",
        inputBg: "#0D0D0D",
      }
    : {
        bg: "#F5F5F5",
        card: "#FFFFFF",
        text: "#000000",
        primary: "#000000",
        border: "#E0E0E0",
        inputBg: "#F8F8F8",
      };

  const categories = [
    { id: "all", name: "All", icon: "apps" },
    { id: "haircut", name: "Haircut", icon: "cut" },
    { id: "shaving", name: "Shaving", icon: "man" },
    { id: "facial", name: "Facial", icon: "happy" },
    { id: "massage", name: "Massage", icon: "hand-left" },
  ];

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      const response = await salonAPI.getAll();
      setSalons(response.data);
    } catch (error) {
      console.error("Error fetching salons:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSalons = salons.filter((salon: any) => {
    const matchesSearch =
      salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salon.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // ✨ Helper function to check if salon is currently open
  const isCurrentlyOpen = (salon: any) => {
    if (!salon.is_active || !salon.opening_time || !salon.closing_time) {
      return false;
    }

    try {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMinutes = currentHours * 60 + currentMinutes;

      // Parse opening time (format: "HH:MM:SS" or "HH:MM")
      const openingParts = salon.opening_time.split(":");
      const openingHours = parseInt(openingParts[0], 10);
      const openingMinutes = parseInt(openingParts[1], 10);
      const openingTotalMinutes = openingHours * 60 + openingMinutes;

      // Parse closing time (format: "HH:MM:SS" or "HH:MM")
      const closingParts = salon.closing_time.split(":");
      const closingHours = parseInt(closingParts[0], 10);
      const closingMinutes = parseInt(closingParts[1], 10);
      const closingTotalMinutes = closingHours * 60 + closingMinutes;

      // Check if current time is within operating hours
      return (
        currentTotalMinutes >= openingTotalMinutes &&
        currentTotalMinutes < closingTotalMinutes
      );
    } catch (error) {
      console.error("Error checking salon open status:", error);
      return false;
    }
  };

  const displayName = user?.first_name || user?.username || "Guest";

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>
              Hello! 👋
            </Text>
            <Text style={[styles.userName, { color: theme.text }]}>
              {displayName}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.notificationButton,
              { backgroundColor: theme.inputBg },
            ]}
            onPress={() => navigation.navigate("Profile")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.text}
            />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        <View
          style={[styles.searchContainer, { backgroundColor: theme.inputBg }]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.text}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search salons, services..."
            placeholderTextColor={theme.text + "80"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={theme.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchSalons} />
        }
      >
        {/* Categories */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      selectedCategory === category.id
                        ? theme.primary
                        : theme.card,
                    borderColor:
                      selectedCategory === category.id
                        ? theme.primary
                        : theme.border,
                  },
                ]}
                onPress={() =>
                  setSelectedCategory(
                    category.id === "all" ? null : category.id
                  )
                }
              >
                <Ionicons
                  name={category.icon as any}
                  size={20}
                  color={
                    selectedCategory === category.id
                      ? isDark
                        ? "#000"
                        : "#FFF"
                      : theme.text
                  }
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color:
                        selectedCategory === category.id
                          ? isDark
                            ? "#000"
                            : "#FFF"
                          : theme.text,
                    },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Promotion Banner */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.promoBanner, { backgroundColor: theme.primary }]}
          >
            <View style={styles.promoContent}>
              <Text
                style={[styles.promoTitle, { color: isDark ? "#000" : "#FFF" }]}
              >
                🎉 Special Offer!
              </Text>
              <Text
                style={[styles.promoText, { color: isDark ? "#000" : "#FFF" }]}
              >
                Get 20% off on your first booking
              </Text>
              <View
                style={[
                  styles.promoButton,
                  { backgroundColor: isDark ? "#FFF" : "#000" },
                ]}
              >
                <Text
                  style={[
                    styles.promoButtonText,
                    { color: isDark ? "#000" : "#FFF" },
                  ]}
                >
                  Book Now
                </Text>
              </View>
            </View>
            <Ionicons
              name="gift"
              size={60}
              color={isDark ? "#00000030" : "#FFFFFF30"}
            />
          </TouchableOpacity>
        </View>

        {/* Salons List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {searchQuery ? "Search Results" : "Nearby Salons"}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Salons")}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {filteredSalons.length === 0 ? (
            <View
              style={[styles.emptyContainer, { backgroundColor: theme.card }]}
            >
              <Ionicons
                name="storefront-outline"
                size={60}
                color={theme.text + "50"}
              />
              <Text style={[styles.emptyText, { color: theme.text }]}>
                {searchQuery ? "No salons found" : "No salons available"}
              </Text>
            </View>
          ) : (
            filteredSalons.slice(0, 5).map((salon: any) => (
              <TouchableOpacity
                key={salon.id}
                style={[styles.salonCard, { backgroundColor: theme.card }]}
                onPress={() =>
                  navigation.navigate("SalonDetail", {
                    id: salon.id,
                    from: "customer",
                  })
                }
              >
                <View
                  style={[
                    styles.salonImage,
                    { backgroundColor: theme.inputBg },
                  ]}
                >
                  {salon.image ? (
                    <Text>IMG</Text>
                  ) : (
                    <Ionicons
                      name="storefront"
                      size={32}
                      color={theme.primary}
                    />
                  )}
                </View>
                <View style={styles.salonInfo}>
                  <Text
                    style={[styles.salonName, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {salon.name}
                  </Text>
                  <Text
                    style={[
                      styles.salonAddress,
                      { color: theme.text, opacity: 0.6 },
                    ]}
                    numberOfLines={1}
                  >
                    {salon.address}
                  </Text>
                  <View style={styles.salonMeta}>
                    <View style={styles.rating}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={[styles.ratingText, { color: theme.text }]}>
                        {salon.rating || "0.0"}
                      </Text>
                      <Text
                        style={[
                          styles.reviewCount,
                          { color: theme.text, opacity: 0.5 },
                        ]}
                      >
                        ({salon.total_reviews || 0})
                      </Text>
                    </View>
                    {isCurrentlyOpen(salon) && (
                      <View style={styles.openBadge}>
                        <View style={styles.openDot} />
                        <Text style={styles.openText}>Open</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.text} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 16, fontFamily: fonts.body.regular, opacity: 0.7 },
  userName: { fontSize: 24, fontFamily: fonts.heading.bold, marginTop: 4 },
  notificationButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B6B",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, fontFamily: fonts.body.regular },
  content: { flex: 1 },
  categoriesSection: { paddingVertical: 15, paddingLeft: 20 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.5,
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: fonts.body.semiBold,
    marginLeft: 6,
  },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 20, fontFamily: fonts.heading.bold },
  seeAll: { fontSize: 14, fontFamily: fonts.body.semiBold },
  promoBanner: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },
  promoContent: { flex: 1 },
  promoTitle: { fontSize: 22, fontFamily: fonts.heading.bold, marginBottom: 6 },
  promoText: {
    fontSize: 14,
    fontFamily: fonts.body.regular,
    opacity: 0.9,
    marginBottom: 12,
  },
  promoButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  promoButtonText: { fontSize: 14, fontFamily: fonts.body.bold },
  salonCard: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
  },
  salonImage: {
    width: 70,
    height: 70,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  salonInfo: { flex: 1 },
  salonName: {
    fontSize: 18,
    fontFamily: fonts.heading.semiBold,
    marginBottom: 4,
  },
  salonAddress: {
    fontSize: 14,
    fontFamily: fonts.body.regular,
    marginBottom: 8,
  },
  salonMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rating: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 14, marginLeft: 4, fontFamily: fonts.body.semiBold },
  reviewCount: { fontSize: 12, marginLeft: 4, fontFamily: fonts.body.regular },
  openBadge: { flexDirection: "row", alignItems: "center" },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
    marginRight: 4,
  },
  openText: { fontSize: 12, color: "#4CAF50", fontFamily: fonts.body.semiBold },
  emptyContainer: { padding: 40, borderRadius: 20, alignItems: "center" },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.body.regular,
    marginTop: 15,
    textAlign: "center",
  },
});
