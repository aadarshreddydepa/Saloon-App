import { api } from '../services/api';

export const testConnection = async () => {
  try {
    const response = await api.get('/salons/');
    console.log('✅ Connection successful!', response.data);
    return true;
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Make sure Django server is running on the correct IP and port');
    }
    return false;
  }
};
