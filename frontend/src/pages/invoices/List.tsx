import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { invoicesApi, customersApi } from '../../api';
import type { Invoice } from '../../api/invoices';
import { toast } from 'sonner';

export default function InvoiceList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;
  const customerId = searchParams.get('customerId') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (customerId) params.customerId = customerId;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      
      const res = await invoicesApi.getInvoices(params);
      setInvoices(res.data);
      setTotal(res.total);
    } catch (error: any) {
      toast.error('Failed to load invoices', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await customersApi.getCustomers({ limit: 100 });
      setCustomers(res.data);
    } catch (error) {
      // soft fail
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [page, customerId, dateFrom, dateTo]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // reset page to 1 when filters change
    if (key !== 'page') newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex-1 overflow-y-auto bg-surface-bright p-6 md:p-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-headline font-semibold text-on-surface mb-2 tracking-tight">Invoices</h1>
          <p className="text-sm font-body text-on-surface-variant">Manage and track customer invoices.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-variant p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-on-surface mb-1">Customer</label>
          <select 
            value={customerId}
            onChange={(e) => updateParam('customerId', e.target.value)}
            className="w-full h-10 bg-surface-bright border-b border-outline-variant focus:border-primary outline-none px-3 text-sm text-on-surface appearance-none rounded-none"
          >
            <option value="">All Customers</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.businessName || c.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs font-semibold text-on-surface mb-1">Date Range</label>
          <div className="flex h-10 bg-surface-bright border-b border-outline-variant focus-within:border-primary">
            <input 
              type="date"
              value={dateFrom}
              onChange={(e) => updateParam('dateFrom', e.target.value)}
              className="w-full bg-transparent border-none outline-none px-3 text-sm text-on-surface h-full" 
            />
            <span className="flex items-center justify-center px-2 text-on-surface-variant">-</span>
            <input 
              type="date"
              value={dateTo}
              onChange={(e) => updateParam('dateTo', e.target.value)}
              className="w-full bg-transparent border-none outline-none px-3 text-sm text-on-surface h-full" 
            />
          </div>
        </div>

        <button 
          onClick={() => setSearchParams(new URLSearchParams())}
          className="bg-surface-bright border border-outline-variant text-on-surface hover:bg-surface-container px-4 h-10 text-sm font-medium transition-colors flex items-center justify-center rounded-none"
        >
          Clear Filters
        </button>
      </div>

      {/* Data Table */}
      <div className="w-full overflow-x-auto border border-outline-variant">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-variant border-b border-outline-variant">
              <th className="p-3 text-xs font-semibold text-on-surface uppercase tracking-wider">Invoice No</th>
              <th className="p-3 text-xs font-semibold text-on-surface uppercase tracking-wider">Linked Challan</th>
              <th className="p-3 text-xs font-semibold text-on-surface uppercase tracking-wider">Customer</th>
              <th className="p-3 text-xs font-semibold text-on-surface uppercase tracking-wider">Date</th>
              <th className="p-3 text-xs font-semibold text-on-surface uppercase tracking-wider text-right">Amount</th>
              <th className="p-3 text-xs font-semibold text-on-surface uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-on-surface-variant">Loading invoices...</td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-on-surface-variant">No invoices found.</td>
              </tr>
            ) : (
              invoices.map((invoice, idx) => (
                <tr 
                  key={invoice.id} 
                  className={`border-b border-outline-variant ${idx % 2 === 0 ? 'bg-surface-bright' : 'bg-surface-variant'} hover:bg-surface-container-low transition-colors cursor-pointer`}
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  <td className="p-3 font-medium text-primary hover:underline">{invoice.invoiceNumber}</td>
                  <td className="p-3 text-on-surface-variant">{invoice.challan?.challanNumber}</td>
                  <td className="p-3">{invoice.customer?.businessName || invoice.customer?.name}</td>
                  <td className="p-3 text-on-surface-variant">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right font-medium">${Number(invoice.totalAmount).toFixed(2)}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 bg-surface-container-highest text-on-surface text-xs font-semibold uppercase tracking-wider">
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between border-t border-outline-variant pt-4 mt-4">
          <div className="text-sm text-on-surface-variant">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
          </div>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => updateParam('page', String(page - 1))}
              className="w-8 h-8 flex items-center justify-center bg-surface-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary font-medium text-sm transition-colors">
              {page}
            </span>
            <button 
              disabled={page >= totalPages}
              onClick={() => updateParam('page', String(page + 1))}
              className="w-8 h-8 flex items-center justify-center bg-surface-variant text-on-surface hover:bg-surface-container transition-colors font-medium text-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
