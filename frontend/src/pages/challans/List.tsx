import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { challansApi } from '../../api';
import type { Challan } from '../../api/challans';
import { toast } from 'sonner';

export default function ChallanList() {
  const navigate = useNavigate();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [status, setStatus] = useState<string>('');
  
  const fetchChallans = async () => {
    try {
      setLoading(true);
      const data = await challansApi.getChallans({ status });
      setChallans(data.data);
    } catch (error: any) {
      toast.error('Failed to load challans', { description: error.response?.data?.error || error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [status]);

  const getStatusBadge = (status: string) => {
    if (status === 'CONFIRMED') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-tertiary-container text-on-tertiary-container border border-tertiary-fixed-dim/30">
          Confirmed
        </span>
      );
    }
    if (status === 'DRAFT') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-container-highest text-on-surface border border-outline-variant">
          Draft
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-error-container text-on-error-container border border-error/30">
        Cancelled
      </span>
    );
  };

  return (
    <div className="flex-1 max-w-[1600px] w-full mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-on-surface tracking-tight">Sales Challans</h2>
          <p className="text-sm text-on-surface-variant mt-1">Manage and track delivery challans.</p>
        </div>
        <button 
          onClick={() => navigate('/challans/new')}
          className="bg-primary text-on-primary h-10 px-4 rounded text-sm font-medium hover:bg-primary-fixed-variant transition-colors flex items-center gap-2 shadow-sm active:scale-95 duration-150 w-full sm:w-auto justify-center"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Challan
        </button>
      </div>

      {/* Filters & Controls Bar */}
      <div className="bg-surface border border-outline-variant rounded p-4 mb-6 flex flex-wrap gap-4 items-end shadow-sm">
        <div className="w-full sm:w-auto min-w-[160px]">
          <label className="block text-xs font-medium text-on-surface-variant mb-1">Status</label>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-surface-container h-10 px-3 py-0 border-transparent rounded text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface w-full outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface border border-outline-variant rounded overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant">
                <th className="py-3 px-4 font-semibold text-on-surface whitespace-nowrap cursor-pointer hover:bg-surface-container-high transition-colors">
                  Challan No
                </th>
                <th className="py-3 px-4 font-semibold text-on-surface">Customer</th>
                <th className="py-3 px-4 font-semibold text-on-surface">Date</th>
                <th className="py-3 px-4 font-semibold text-on-surface text-right">Amount</th>
                <th className="py-3 px-4 font-semibold text-on-surface">Status</th>
                <th className="py-3 px-4 font-semibold text-on-surface w-16 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-on-secondary-container">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant">Loading...</td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant">No challans found</td>
                </tr>
              ) : (
                challans.map((challan) => (
                  <tr key={challan.id} className="hover:bg-surface-container-low transition-colors group">
                    <td 
                      className="py-3 px-4 font-medium text-primary cursor-pointer hover:underline"
                      onClick={() => navigate(`/challans/${challan.id}`)}
                    >
                      {challan.challanNumber}
                    </td>
                    <td className="py-3 px-4">{challan.customer?.businessName || challan.customerSnapshot.businessName}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-on-surface-variant">
                      {new Date(challan.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${challan.status === 'CANCELLED' ? 'text-on-surface-variant line-through opacity-70' : 'text-on-surface'}`}>
                      ${Number(challan.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(challan.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => navigate(`/challans/${challan.id}`)}
                        className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-surface-container opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
