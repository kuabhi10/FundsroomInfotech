import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

export * as customersApi from './customers';
export * as productsApi from './products';
export * as stockMovementsApi from './stockMovements';
export * as challansApi from './challans';

export default api;
