// Navigation type definitions for React Navigation
import { NavigationProp } from '@react-navigation/native';

// Define all the routes and their parameters
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  SalonDetail: {
    id: number | string;
    from?: string;
  };
  BookAppointment: {
    salonId: number | string;
    salonName?: string;
  };
  AddSalon: undefined;
  AddBarber: undefined;
  AddService: undefined;
  ManageServices: undefined;
  ManageBarbers: undefined;
  JoinSalonRequest: undefined;
};

export type TabParamList = {
  Home: undefined;
  Salons: undefined;
  Bookings: undefined;
  Profile: undefined;
  Dashboard: undefined;
  'My Salons': undefined;
  Schedule: undefined;
};

// Combined navigation type for screens that can navigate to both tab and stack screens
export type AppNavigationProp = NavigationProp<MainStackParamList & TabParamList>;
