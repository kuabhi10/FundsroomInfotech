import axios from 'axios';
import { getStoredToken } from '../store/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export * as customersApi from './customers';
export * as productsApi from './products';
export * as stockMovementsApi from './stockMovements';
export * as challansApi from './challans';
export * as invoicesApi from './invoices';
export * as dashboardApi from './dashboard';

export default api;
