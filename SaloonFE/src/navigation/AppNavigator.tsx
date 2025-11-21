import React from "react";
import { useColorScheme, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useAuthStore } from "../store/authStore";
import { fonts } from "../config/fonts";

import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import SalonListScreen from "../screens/SalonListScreen";
import BookingScreen from "../screens/BookingScreen";
import ProfileScreen from "../screens/ProfileScreen";

import CustomerSalonDetail from "../screens/customer/CustomerSalonDetail";
import BookAppointment from "../screens/customer/BookAppointment";

import OwnerDashboard from "../screens/owner/OwnerDashboard";
import AddSalon from "../screens/owner/AddSalon";
import ManageSalons from "../screens/owner/ManageSalons";
import AddBarber from "../screens/owner/AddBarber";
import OwnerBookings from "../screens/owner/OwnerBookings";
import AddService from "../screens/owner/AddService";
import ManageServices from "../screens/owner/ManageServices";
import SalonDetail from "../screens/owner/SalonDetail";
import ManageBarbers from "../screens/owner/ManageBarbers";

import BarberDashboard from "../screens/barber/BarberDashboard";
import JoinSalonRequest from "../screens/barber/JoinSalonRequest";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ✨ Glossy Tab Bar Background Component
const GlossyTabBar = ({ isDark }: { isDark: boolean }) => {
  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={isDark ? 80 : 95}
        tint={isDark ? "dark" : "light"}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    );
  }
  return null;
};

const CustomerTabNavigator = () => {
  const isDark = useColorScheme() === "dark";

  // ✨ Enhanced glossy theme with gradients
  const theme = isDark
    ? {
        bg: "rgba(26, 26, 26, 0.95)",
        active: "#FFFFFF",
        inactive: "#888888",
        border: "rgba(255, 255, 255, 0.1)",
        shadow: "#000000",
      }
    : {
        bg: "rgba(255, 255, 255, 0.95)",
        active: "#000000",
        inactive: "#999999",
        border: "rgba(0, 0, 0, 0.05)",
        shadow: "#000000",
      };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.active,
        tabBarInactiveTintColor: theme.inactive,
        tabBarLabelStyle: {
          fontFamily: fonts.body.semiBold,
          fontSize: 11,
          marginBottom: 4,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "transparent" : theme.bg,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          height: 85,
          paddingBottom: 28,
          paddingTop: 8,
          elevation: 0,
          // ✨ Glossy shadow effect
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 12,
        },
        tabBarBackground: () => <GlossyTabBar isDark={isDark} />,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Salons"
        component={SalonListScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "storefront" : "storefront-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const OwnerTabNavigator = () => {
  const isDark = useColorScheme() === "dark";

  const theme = isDark
    ? {
        bg: "rgba(26, 26, 26, 0.95)",
        active: "#FFFFFF",
        inactive: "#888888",
        border: "rgba(255, 255, 255, 0.1)",
        shadow: "#000000",
      }
    : {
        bg: "rgba(255, 255, 255, 0.95)",
        active: "#000000",
        inactive: "#999999",
        border: "rgba(0, 0, 0, 0.05)",
        shadow: "#000000",
      };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.active,
        tabBarInactiveTintColor: theme.inactive,
        tabBarLabelStyle: {
          fontFamily: fonts.body.semiBold,
          fontSize: 11,
          marginBottom: 4,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "transparent" : theme.bg,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          height: 85,
          paddingBottom: 28,
          paddingTop: 8,
          elevation: 0,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 12,
        },
        tabBarBackground: () => <GlossyTabBar isDark={isDark} />,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={OwnerDashboard}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="My Salons"
        component={ManageSalons}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "storefront" : "storefront-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={OwnerBookings}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const BarberTabNavigator = () => {
  const isDark = useColorScheme() === "dark";

  const theme = isDark
    ? {
        bg: "rgba(26, 26, 26, 0.95)",
        active: "#FFFFFF",
        inactive: "#888888",
        border: "rgba(255, 255, 255, 0.1)",
        shadow: "#000000",
      }
    : {
        bg: "rgba(255, 255, 255, 0.95)",
        active: "#000000",
        inactive: "#999999",
        border: "rgba(0, 0, 0, 0.05)",
        shadow: "#000000",
      };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.active,
        tabBarInactiveTintColor: theme.inactive,
        tabBarLabelStyle: {
          fontFamily: fonts.body.semiBold,
          fontSize: 11,
          marginBottom: 4,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "transparent" : theme.bg,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          height: 85,
          paddingBottom: 28,
          paddingTop: 8,
          elevation: 0,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 12,
        },
        tabBarBackground: () => <GlossyTabBar isDark={isDark} />,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={BarberDashboard}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={BookingScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

function MainNavigator() {
  const { user } = useAuthStore();

  let TabComponent = CustomerTabNavigator;
  if (user?.user_type === "owner") TabComponent = OwnerTabNavigator;
  if (user?.user_type === "barber") TabComponent = BarberTabNavigator;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabComponent} />
      <Stack.Screen
        name="SalonDetail"
        component={
          user?.user_type === "owner" ? SalonDetail : CustomerSalonDetail
        }
      />
      <Stack.Screen name="BookAppointment" component={BookAppointment} />
      <Stack.Screen name="AddSalon" component={AddSalon} />
      <Stack.Screen name="AddBarber" component={AddBarber} />
      <Stack.Screen name="AddService" component={AddService} />
      <Stack.Screen name="ManageServices" component={ManageServices} />
      <Stack.Screen name="ManageBarbers" component={ManageBarbers} />
      <Stack.Screen name="JoinSalonRequest" component={JoinSalonRequest} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
