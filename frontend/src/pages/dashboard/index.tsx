import { useEffect, useState } from 'react';
import { Users, Package, FileText, AlertTriangle, TrendingUp, Minus, ArrowRight, Download, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboard';
import type { DashboardSummary } from '../../api/dashboard';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/ui/button';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await dashboardApi.getSummary();
        setSummary(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard summary', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const role = user?.role || 'SALES';

  const canViewCustomers = ['ADMIN', 'SALES'].includes(role);
  const canViewProducts = ['ADMIN', 'WAREHOUSE'].includes(role);
  const canViewChallans = ['ADMIN', 'SALES', 'WAREHOUSE'].includes(role);
  const canViewAlerts = ['ADMIN', 'WAREHOUSE'].includes(role);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-8 lg:p-12 bg-surface w-full">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-outline-variant pb-6 gap-4">
          <div>
            <h1 className="text-[32px] font-semibold text-on-surface leading-tight tracking-tight">Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">Key metrics and active alerts for your enterprise.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="h-10 px-4 text-primary border-primary hover:bg-primary/10 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button className="h-10 px-4">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Customers */}
          {canViewCustomers && (
            <div className="bg-muted/30 p-6 border-l-4 border-primary hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Customers</span>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="text-[32px] font-light text-foreground mb-2">{summary?.totalCustomers || 0}</div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12% this month</span>
              </div>
            </div>
          )}

          {/* Total Products */}
          {canViewProducts && (
            <div className="bg-muted/30 p-6 border-l-4 border-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Products</span>
                <Package className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-[32px] font-light text-foreground mb-2">{summary?.totalProducts || 0}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Minus className="w-3.5 h-3.5" />
                <span>Stable inventory</span>
              </div>
            </div>
          )}

          {/* Sales Challans */}
          {canViewChallans && (
            <div className="bg-muted/30 p-6 border-l-4 border-blue-600 hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Challans (Draft/Conf)</span>
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[32px] font-light text-foreground">{summary?.draftChallans || 0}</span>
                <span className="text-lg text-muted-foreground">/ {summary?.confirmedChallans || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Active documents</span>
              </div>
            </div>
          )}

          {/* Low Stock Alert */}
          {canViewAlerts && (
            <Link to="/products?filter=low-stock" className="block bg-destructive/10 p-6 border-l-4 border-destructive hover:bg-destructive/20 transition-colors group relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-destructive opacity-10 rounded-bl-full transform group-hover:scale-110 transition-transform"></div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-xs font-semibold uppercase tracking-wider text-destructive">Low-Stock Alerts</span>
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div className="text-[32px] font-bold text-destructive mb-2 relative z-10">{summary?.lowStockAlerts || 0}</div>
              <div className="flex items-center gap-1 text-xs text-destructive font-medium relative z-10 group-hover:underline">
                <span>Requires immediate attention</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
