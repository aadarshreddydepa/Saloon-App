import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.7:8000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register/', data),
  login: (credentials: any) => api.post('/auth/login/', credentials),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data: any) => api.put('/auth/profile/', data),
};

export const salonAPI = {
  getAll: () => api.get('/salons/'),
  getById: (id: number) => api.get(`/salons/${id}/`),
  getNearby: (lat: number, lng: number, radius: number) =>
    api.get(`/salons/nearby/?latitude=${lat}&longitude=${lng}&radius=${radius}`),
  create: (data: any) => api.post('/salons/', data),
};

export const bookingAPI = {
  getAll: () => api.get('/bookings/'),
  getById: (id: number) => api.get(`/bookings/${id}/`),
  create: (data: any) => api.post('/bookings/', data),
  cancel: (id: number) => api.post(`/bookings/${id}/cancel/`),
};

export const serviceAPI = {
  getAll: () => api.get('/services/'),
  getBySalon: (salonId: number) => api.get(`/services/?salon=${salonId}`),
};

export const reviewAPI = {
  getAll: () => api.get('/reviews/'),
  getBySalon: (salonId: number) => api.get(`/reviews/?salon=${salonId}`),
  create: (data: any) => api.post('/reviews/', data),
};
