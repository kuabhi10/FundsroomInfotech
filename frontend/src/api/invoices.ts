import api from './index';
import type { Customer } from '../types/customer';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  challanId: string;
  customerId: string;
  totalAmount: number | string;
  status: 'GENERATED';
  createdAt: string;
  customer?: Customer;
  challan?: {
    challanNumber: string;
    items?: any[];
  };
}

export interface GetInvoicesResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
}

export const getInvoices = async (params?: any): Promise<GetInvoicesResponse> => {
  const { data } = await api.get('/invoices', { params });
  return data;
};

export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const { data } = await api.get(`/invoices/${id}`);
  return data.data;
};

export const createInvoice = async (challanId: string): Promise<Invoice> => {
  const { data } = await api.post('/invoices', { challanId });
  return data.data;
};
