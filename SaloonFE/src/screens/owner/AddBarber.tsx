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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { salonAPI } from "../../services/api";
import { fonts } from "../../config/fonts";

export default function AddBarber() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const [loading, setLoading] = useState(false);
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState<any>(null);

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
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Add Barber
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Ionicons name="information-circle" size={24} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.text }]}>
            Barber must first register as a user with user_type='barber', then
            you can assign them to your salon.
          </Text>
        </View>

        <Text style={[styles.instruction, { color: theme.text }]}>
          To add a barber:{"\n"}
          1. Ask them to register with user type "Barber"{"\n"}
          2. Get their user ID{"\n"}
          3. Contact support to assign them to your salon
        </Text>
      </ScrollView>
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
  headerTitle: { fontSize: 20, fontFamily: fonts.heading.bold },
  content: { flex: 1, padding: 20 },
  infoCard: {
    flexDirection: "row",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.body.regular,
  },
  instruction: {
    fontSize: 16,
    lineHeight: 28,
    marginTop: 20,
    fontFamily: fonts.body.regular,
  },
});
