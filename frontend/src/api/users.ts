import api from './index';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  role: User['role'];
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: User['role'];
}

export const usersApi = {
  getUsers: async (params?: { page?: number; limit?: number; search?: string }): Promise<GetUsersResponse> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  createUser: async (data: CreateUserPayload): Promise<{ data: User }> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserPayload): Promise<{ data: User }> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  updateUserStatus: async (id: string, isActive: boolean): Promise<{ data: User }> => {
    const response = await api.patch(`/users/${id}/status`, { isActive });
    return response.data;
  }
};
