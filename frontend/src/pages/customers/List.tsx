import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../../api/customers';
import type { Customer } from '../../types/customer';
import { useAuthStore } from '../../store/auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';

export default function CustomerList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canWrite = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [data, setData] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await getCustomers({
          search: debouncedSearch || undefined,
          status: status || undefined,
          type: type || undefined,
          page,
          limit,
        });
        setData(response.data);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to fetch customers', error);
      }
    };
    fetchCustomers();
  }, [debouncedSearch, status, type, page]);

  const handleRowClick = (id: string) => {
    navigate(`/customers/${id}`);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-[var(--color-tertiary-container)] text-[var(--color-on-tertiary-container)] hover:bg-[var(--color-tertiary-container)] uppercase tracking-wider">Active</Badge>;
      case 'LEAD':
        return <Badge className="bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] uppercase tracking-wider">Lead</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-[var(--color-error-container)] text-[var(--color-on-error-container)] hover:bg-[var(--color-error-container)] uppercase tracking-wider">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-surface)] h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-on-surface)] font-headline">Customers</h2>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">Manage client relationships, contact details, and account status.</p>
          </div>
          {canWrite && (
            <button 
              onClick={() => navigate('/customers/new')}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-fixed-dim)] text-white text-sm font-medium h-10 px-4 flex items-center transition-colors active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined mr-2 text-sm">add</span>
              Add Customer
            </button>
          )}
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-[var(--color-surface-container-low)] p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]">search</span>
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-[var(--color-surface)] border-b border-[var(--color-outline)] text-sm focus:border-[var(--color-primary)] focus:outline-none font-body placeholder:text-[var(--color-on-surface-variant)] text-[var(--color-on-surface)]" 
              placeholder="Filter by name, mobile, or business..." 
              type="text" 
            />
          </div>
          <div className="flex gap-4">
            <select 
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="h-10 px-4 bg-[var(--color-surface)] border-b border-[var(--color-outline)] text-sm focus:border-[var(--color-primary)] focus:outline-none font-body min-w-[150px] appearance-none text-[var(--color-on-surface)]"
            >
              <option value="">Status: All</option>
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <select 
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="h-10 px-4 bg-[var(--color-surface)] border-b border-[var(--color-outline)] text-sm focus:border-[var(--color-primary)] focus:outline-none font-body min-w-[150px] appearance-none text-[var(--color-on-surface)]"
            >
              <option value="">Type: All</option>
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] overflow-x-auto">
          <Table>
            <TableHeader className="bg-[var(--color-surface-container-low)]">
              <TableRow className="border-b border-[var(--color-outline-variant)]">
                <TableHead className="font-semibold text-[var(--color-on-surface)]">Name</TableHead>
                <TableHead className="font-semibold text-[var(--color-on-surface)]">Business</TableHead>
                <TableHead className="font-semibold text-[var(--color-on-surface)]">Type</TableHead>
                <TableHead className="font-semibold text-[var(--color-on-surface)]">Status</TableHead>
                <TableHead className="font-semibold text-[var(--color-on-surface)] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[var(--color-outline-variant)]">
              {data.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-[var(--color-surface-container-low)] transition-colors group cursor-pointer" onClick={() => handleRowClick(customer.id)}>
                  <TableCell>
                    <div className="font-medium text-[var(--color-on-surface)]">{customer.name}</div>
                    <div className="text-xs text-[var(--color-on-surface-variant)]">{customer.mobile}</div>
                  </TableCell>
                  <TableCell className="text-[var(--color-on-surface)]">{customer.businessName}</TableCell>
                  <TableCell className="text-[var(--color-on-surface-variant)] capitalize">{customer.customerType.toLowerCase()}</TableCell>
                  <TableCell>
                    {getStatusBadge(customer.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canWrite && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/customers/${customer.id}/edit`); }}
                          className="p-1.5 text-[var(--color-primary)] hover:bg-[var(--color-primary-container)] rounded" 
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRowClick(customer.id); }}
                        className="p-1.5 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] rounded" 
                        title="View Details"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-[var(--color-on-surface-variant)]">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <div className="bg-[var(--color-surface-container-low)] border-t border-[var(--color-outline-variant)] px-4 py-3 flex items-center justify-between">
            <div className="text-xs text-[var(--color-on-surface-variant)]">
              Showing {data.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} of {total} results
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex space-x-1 ml-4">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="p-1 px-3 text-[var(--color-on-surface)] bg-[var(--color-surface-container)] rounded">{page}</button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
