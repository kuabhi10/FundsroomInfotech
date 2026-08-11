import api from './axios';
import type { Customer, CustomerQuery, PaginatedResponse, CustomerNote } from '../types/customer';

export const getCustomers = async (params?: CustomerQuery): Promise<PaginatedResponse<Customer>> => {
  const { data } = await api.get<PaginatedResponse<Customer>>('/customers', { params });
  return data;
};

export const getCustomer = async (id: string): Promise<{ data: Customer }> => {
  const { data } = await api.get<{ data: Customer }>(`/customers/${id}`);
  return data;
};

export const createCustomer = async (customerData: Partial<Customer>): Promise<{ data: Customer }> => {
  const { data } = await api.post<{ data: Customer }>('/customers', customerData);
  return data;
};

export const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<{ data: Customer }> => {
  const { data } = await api.put<{ data: Customer }>(`/customers/${id}`, customerData);
  return data;
};

export const addCustomerNote = async (id: string, note: string): Promise<{ data: CustomerNote[] }> => {
  const { data } = await api.post<{ data: CustomerNote[] }>(`/customers/${id}/notes`, { note });
  return data;
};
