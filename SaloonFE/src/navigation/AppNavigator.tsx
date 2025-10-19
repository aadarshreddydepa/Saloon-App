import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import SalonListScreen from '../screens/SalonListScreen';
import BookingScreen from '../screens/BookingScreen';
import ProfileScreen from '../screens/ProfileScreen';

import CustomerSalonDetail from '../screens/customer/CustomerSalonDetail';
import BookAppointment from '../screens/customer/BookAppointment';

import OwnerDashboard from '../screens/owner/OwnerDashboard';
import AddSalon from '../screens/owner/AddSalon';
import ManageSalons from '../screens/owner/ManageSalons';
import AddBarber from '../screens/owner/AddBarber';
import OwnerBookings from '../screens/owner/OwnerBookings';
import AddService from '../screens/owner/AddService';
import ManageServices from '../screens/owner/ManageServices';
import SalonDetail from '../screens/owner/SalonDetail';
import ManageBarbers from '../screens/owner/ManageBarbers';

import BarberDashboard from '../screens/barber/BarberDashboard';
import JoinSalonRequest from '../screens/barber/JoinSalonRequest';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CustomerTabNavigator = () => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark 
    ? { bg: '#1A1A1A', active: '#C0C0C0', inactive: '#666666' }
    : { bg: '#FFFFFF', active: '#000000', inactive: '#999999' };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.active,
        tabBarInactiveTintColor: theme.inactive,
        tabBarStyle: { backgroundColor: theme.bg, borderTopWidth: 0, height: 60, paddingBottom: 8 },
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tab.Screen name="Salons" component={SalonListScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="storefront" size={size} color={color} /> }} />
      <Tab.Screen name="Bookings" component={BookingScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
};

const OwnerTabNavigator = () => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark 
    ? { bg: '#1A1A1A', active: '#C0C0C0', inactive: '#666666' }
    : { bg: '#FFFFFF', active: '#000000', inactive: '#999999' };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.active,
        tabBarInactiveTintColor: theme.inactive,
        tabBarStyle: { backgroundColor: theme.bg, borderTopWidth: 0, height: 60, paddingBottom: 8 },
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={OwnerDashboard} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} /> }} />
      <Tab.Screen name="My Salons" component={ManageSalons} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="storefront" size={size} color={color} /> }} />
      <Tab.Screen name="Bookings" component={OwnerBookings} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
};

const BarberTabNavigator = () => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark 
    ? { bg: '#1A1A1A', active: '#C0C0C0', inactive: '#666666' }
    : { bg: '#FFFFFF', active: '#000000', inactive: '#999999' };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.active,
        tabBarInactiveTintColor: theme.inactive,
        tabBarStyle: { backgroundColor: theme.bg, borderTopWidth: 0, height: 60, paddingBottom: 8 },
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={BarberDashboard} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tab.Screen name="Schedule" component={BookingScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
};

function MainNavigator() {
  const { user } = useAuthStore();
  
  let TabComponent = CustomerTabNavigator;
  if (user?.user_type === 'owner') TabComponent = OwnerTabNavigator;
  if (user?.user_type === 'barber') TabComponent = BarberTabNavigator;
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabComponent} />
      <Stack.Screen name="SalonDetail" component={user?.user_type === 'owner' ? SalonDetail : CustomerSalonDetail} />
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
