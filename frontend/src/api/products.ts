import api from './axios';
import type { Product, ProductQuery, PaginatedResponse } from '../types/product';

export const getProducts = async (params?: ProductQuery): Promise<PaginatedResponse<Product>> => {
  const { data } = await api.get<PaginatedResponse<Product>>('/products', { params });
  return data;
};

export const getProduct = async (id: string): Promise<{ data: Product }> => {
  const { data } = await api.get<{ data: Product }>(`/products/${id}`);
  return data;
};

export const createProduct = async (productData: Partial<Product>): Promise<{ data: Product }> => {
  const { data } = await api.post<{ data: Product }>('/products', productData);
  return data;
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<{ data: Product }> => {
  const { data } = await api.put<{ data: Product }>(`/products/${id}`, productData);
  return data;
};
