import api from './axios';

export interface ChallanItem {
  id?: string;
  productId: string;
  quantity: number;
  productSnapshot?: {
    name: string;
    sku: string;
    unitPrice: string | number;
  };
  lineTotal?: string | number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  totalQuantity: number;
  totalAmount: string | number;
  createdAt: string;
  customerSnapshot: {
    name: string;
    businessName: string;
    mobile: string;
  };
  items?: ChallanItem[];
  customer?: {
    name: string;
    businessName: string;
    email: string;
    mobile: string;
    address: string;
    gstNumber: string;
  };
}

export const getChallans = async (params?: any) => {
  const response = await api.get('/challans', { params });
  return response.data;
};

export const getChallanById = async (id: string) => {
  const response = await api.get(`/challans/${id}`);
  return response.data.data;
};

export const createChallan = async (data: any) => {
  const response = await api.post('/challans', data);
  return response.data.data;
};

export const updateChallan = async (id: string, data: any) => {
  const response = await api.put(`/challans/${id}`, data);
  return response.data.data;
};

export const confirmChallan = async (id: string) => {
  const response = await api.patch(`/challans/${id}/confirm`);
  return response.data.data;
};

export const cancelChallan = async (id: string) => {
  const response = await api.patch(`/challans/${id}/cancel`);
  return response.data.data;
};
