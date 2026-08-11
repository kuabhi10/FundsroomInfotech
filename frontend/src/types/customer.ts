export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export interface UserSnippet {
  id: string;
  name: string;
  email: string;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  note: string;
  createdById: string;
  createdAt: string;
  createdBy: UserSnippet;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  businessName: string;
  gstNumber: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate: string | null;
  createdAt: string;
  updatedAt: string;
  notes?: CustomerNote[];
  challans?: any[]; // For future Phase 5
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomerQuery {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}
