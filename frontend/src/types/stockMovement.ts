export type MovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  type: MovementType;
  reason: string;
  createdById: string;
  createdAt: string;
  product?: {
    name: string;
    sku: string;
  };
  createdBy?: {
    name: string;
  };
}

export interface StockMovementQuery {
  page?: number;
  limit?: number;
  productId?: string;
  type?: MovementType;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
