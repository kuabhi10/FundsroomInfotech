import api from './axios';

export interface DashboardSummary {
  totalCustomers: number;
  totalProducts: number;
  lowStockAlerts: number;
  draftChallans: number;
  confirmedChallans: number;
}

export const dashboardApi = {
  getSummary: async (): Promise<{ data: DashboardSummary }> => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },
};
