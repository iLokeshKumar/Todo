import { Platform } from 'react-native';
import axios from 'axios';
import storage from '../utils/storage';

// Android Emulator uses 10.0.2.2 to access host localhost
// Web/iOS uses localhost
// Physical device needs machine's LAN IP
const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8000'
  : 'http://192.168.0.26:8000';

const client = axios.create({
  baseURL: BASE_URL,
});

client.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;
