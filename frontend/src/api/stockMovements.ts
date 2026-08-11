import api from './axios';
import type { StockMovement, StockMovementQuery, PaginatedResponse } from '../types/stockMovement';

export const getStockMovements = async (params?: StockMovementQuery): Promise<PaginatedResponse<StockMovement>> => {
  const { data } = await api.get<PaginatedResponse<StockMovement>>('/stock-movements', { params });
  return data;
};

export const createStockMovement = async (movementData: Partial<StockMovement>): Promise<{ data: StockMovement }> => {
  const { data } = await api.post<{ data: StockMovement }>('/stock-movements', movementData);
  return data;
};
