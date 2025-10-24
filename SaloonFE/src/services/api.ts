import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.92.197.248:8000/api';

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
  // Use PATCH for partial updates (only send changed fields)
  updatePartial: (id: number, data: any) => api.patch(`/salons/${id}/`, data),
  // Use PUT for full updates (send all fields)
  update: (id: number, data: any) => api.put(`/salons/${id}/`, data),
  delete: (id: number) => api.delete(`/salons/${id}/`),
};

export const bookingAPI = {
  getAll: () => api.get('/bookings/'),
  getById: (id: number) => api.get(`/bookings/${id}/`),
  getBySalon: (salonId: number) => api.get(`/bookings/?salon=${salonId}`),
  create: (data: any) => api.post('/bookings/', data),
  update: (id: number, data: any) => api.patch(`/bookings/${id}/`, data),
  assignBarber: (bookingId: number, barberId: number) => 
    api.patch(`/bookings/${bookingId}/`, { barber: barberId }),
  cancel: (id: number) => api.post(`/bookings/${id}/cancel/`),
  complete: (id: number) => api.post(`/bookings/${id}/complete/`),
};

export const serviceAPI = {
  getAll: () => api.get('/services/'),
  getBySalon: (salonId: number) => api.get(`/services/?salon=${salonId}`),
  create: (data: any) => api.post('/services/', data),
  update: (id: number, data: any) => api.put(`/services/${id}/`, data),
  delete: (id: number) => api.delete(`/services/${id}/`),
};

export const barberAPI = {
  getAll: () => api.get('/barbers/'),
  getBySalon: (salonId: number) => api.get(`/barbers/?salon=${salonId}`),
  getById: (id: number) => api.get(`/barbers/${id}/`),
  create: (data: any) => api.post('/barbers/', data),
  update: (id: number, data: any) => api.patch(`/barbers/${id}/`, data),
  sendJoinRequest: (salonId: number, data: any) => api.post(`/barbers/join-request/${salonId}/`, data),
  getJoinRequests: (salonId: number) => api.get(`/barbers/join-requests/?salon=${salonId}`),
  approveRequest: (requestId: number) => api.post(`/barbers/approve-request/${requestId}/`),
  rejectRequest: (requestId: number) => api.post(`/barbers/reject-request/${requestId}/`),
};

export const reviewAPI = {
  getAll: () => api.get('/reviews/'),
  getBySalon: (salonId: number) => api.get(`/reviews/?salon=${salonId}`),
  create: (data: any) => api.post('/reviews/', data),
};
