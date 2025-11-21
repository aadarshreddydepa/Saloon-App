import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { salonAPI } from "../../services/api";
import { fonts } from "../../config/fonts";

export default function ManageSalons() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const renderSalon = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.salonCard, { backgroundColor: theme.card }]}
      onPress={() =>
        navigation.navigate("SalonDetail" as never, { id: item.id })
      }
    >
      <View style={[styles.salonIcon, { backgroundColor: theme.inputBg }]}>
        <Ionicons name="storefront" size={32} color={theme.primary} />
      </View>
      <View style={styles.salonInfo}>
        <Text style={[styles.salonName, { color: theme.text }]}>
          {item.name}
        </Text>
        <Text
          style={[styles.salonAddress, { color: theme.text, opacity: 0.6 }]}
          numberOfLines={1}
        >
          {item.address}
        </Text>
        <View style={styles.salonMeta}>
          <View style={styles.rating}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={[styles.ratingText, { color: theme.text }]}>
              {item.rating || "0.0"}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.is_active ? "#4CAF50" : "#F44336" },
            ]}
          >
            <Text style={styles.statusText}>
              {item.is_active ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={theme.text} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          My Salons
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddSalon" as never)}
        >
          <Ionicons name="add-circle" size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={salons}
        renderItem={renderSalon}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchSalons} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="storefront-outline"
              size={80}
              color={theme.text + "50"}
            />
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No salons yet
            </Text>
            <Text
              style={[styles.emptySubtext, { color: theme.text, opacity: 0.6 }]}
            >
              Tap + to add your first salon
            </Text>
          </View>
        }
      />
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
  headerTitle: { fontSize: 28, fontFamily: fonts.heading.bold },
  list: { padding: 20 },
  salonCard: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: "center",
  },
  salonIcon: {
    width: 70,
    height: 70,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  salonInfo: { flex: 1 },
  salonName: { fontSize: 18, fontFamily: fonts.heading.bold, marginBottom: 4 },
  salonAddress: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: fonts.body.regular,
  },
  salonMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rating: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 14, marginLeft: 4, fontFamily: fonts.body.semiBold },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: "#FFF", fontSize: 11, fontFamily: fonts.body.semiBold },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { fontSize: 20, fontFamily: fonts.heading.bold, marginTop: 20 },
  emptySubtext: { fontSize: 14, marginTop: 8, fontFamily: fonts.body.regular },
});
