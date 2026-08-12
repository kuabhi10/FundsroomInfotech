import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getStockMovements, createStockMovement } from '../../api/stockMovements';
import { getProducts } from '../../api/products';
import type { StockMovement, MovementType } from '../../types/stockMovement';
import type { Product } from '../../types/product';
import { useAuthStore } from '../../store/auth';
import { toast } from 'sonner';
import { Spinner } from '../../components/ui/spinner';

export default function StockMovementsList() {
  const { user } = useAuthStore();
  // Allow ADMIN and WAREHOUSE. Hide for SALES and ACCOUNTS.
  const canWrite = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const [searchParams] = useSearchParams();
  const initialProductId = searchParams.get('productId') || '';

  const [data, setData] = useState<StockMovement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isListLoading, setIsListLoading] = useState(true);
  const limit = 10;
  
  // Pending filter input states
  const [productFilter, setProductFilter] = useState(initialProductId);
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Applied filter state (drives data fetching)
  const [appliedFilters, setAppliedFilters] = useState({
    productId: initialProductId,
    type: '',
    dateFrom: '',
    dateTo: '',
  });
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState<{
    productId: string;
    type: MovementType;
    quantity: number;
    reason: string;
  }>({
    productId: initialProductId,
    type: 'IN',
    quantity: 1,
    reason: '',
  });

  const fetchMovements = useCallback(async () => {
    setIsListLoading(true);
    try {
      const response = await getStockMovements({
        type: appliedFilters.type as any || undefined,
        productId: appliedFilters.productId || undefined,
        dateFrom: appliedFilters.dateFrom || undefined,
        dateTo: appliedFilters.dateTo || undefined,
        page,
        limit,
      });
      setData(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch stock movements', error);
    } finally {
      setIsListLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  // Load products for dropdown (in filters and modal)
  useEffect(() => {
    if (products.length === 0) {
      const fetchAllProducts = async () => {
        try {
          const response = await getProducts({ limit: 1000 });
          setProducts(response.data);
          if (response.data.length > 0 && !formData.productId) {
            setFormData(prev => ({ ...prev, productId: response.data[0].id }));
          }
        } catch (error) {
          console.error('Failed to load products for dropdown', error);
        }
      };
      fetchAllProducts();
    }
  }, [products.length, formData.productId]);

  const handleApplyFilters = () => {
    setPage(1);
    setAppliedFilters({
      productId: productFilter,
      type: typeFilter,
      dateFrom,
      dateTo,
    });
  };

  const handleResetFilters = () => {
    setProductFilter('');
    setTypeFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    setAppliedFilters({
      productId: '',
      type: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, total);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    if (name === 'quantity' || name === 'type') {
      setInlineError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInlineError('');

    try {
      await createStockMovement(formData);
      toast.success('Stock movement recorded');
      setShowModal(false);
      setFormData({ productId: products[0]?.id || '', type: 'IN', quantity: 1, reason: '' });
      fetchMovements(); // refresh list
    } catch (error: any) {
      const errMsg = error.response?.data?.error || 'Failed to record movement';
      if (error.response?.status === 400 && formData.type === 'OUT') {
        setInlineError(errMsg);
      } else {
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setInlineError('');
    setShowModal(true);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background relative">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header & Actions */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-semibold text-on-background font-headline tracking-tight mb-1">Stock Movements</h2>
            <p className="text-on-surface-variant font-body text-sm">Monitor all inbound and outbound inventory transactions.</p>
          </div>
          {canWrite && (
            <button 
              onClick={openModal}
              className="bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-body text-sm font-medium px-5 py-2.5 transition-colors flex items-center space-x-2 h-10 shadow-sm rounded-none"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Add Movement</span>
            </button>
          )}
        </div>

        {/* Filters Bar */}
        <div className="bg-surface-container p-4 border border-outline-variant flex flex-col md:flex-row items-start md:items-end justify-between gap-4 shadow-sm rounded-none">
          <div className="flex flex-wrap gap-4 items-end flex-1">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Product</label>
              <div className="relative">
                <select 
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="appearance-none bg-surface border-b border-outline-variant focus:border-primary px-3 py-1.5 pr-8 text-sm font-body text-on-surface min-w-[200px] h-9 focus:ring-0 rounded-none border-t-0 border-l-0 border-r-0"
                >
                  <option value="">All Products</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-sm pointer-events-none">arrow_drop_down</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Type</label>
              <div className="relative">
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none bg-surface border-b border-outline-variant focus:border-primary px-3 py-1.5 pr-8 text-sm font-body text-on-surface min-w-[130px] h-9 focus:ring-0 rounded-none border-t-0 border-l-0 border-r-0"
                >
                  <option value="">All Types</option>
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-sm pointer-events-none">arrow_drop_down</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Date Range</label>
              <div className="relative flex items-center">
                <input 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-surface border-b border-outline-variant focus:border-primary px-3 py-1.5 text-sm font-body text-on-surface h-9 focus:ring-0 rounded-none border-t-0 border-l-0 border-r-0" 
                  type="date" 
                  placeholder="From"
                />
                <span className="mx-2 text-outline-variant">-</span>
                <input 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-surface border-b border-outline-variant focus:border-primary px-3 py-1.5 text-sm font-body text-on-surface h-9 focus:ring-0 rounded-none border-t-0 border-l-0 border-r-0" 
                  type="date" 
                  placeholder="To"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end">
            <button 
              onClick={handleApplyFilters}
              className="bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-body text-sm font-medium px-4 h-9 transition-colors flex items-center space-x-1.5 shadow-sm rounded-none"
            >
              <span className="material-symbols-outlined text-sm">filter_alt</span>
              <span>Apply Filters</span>
            </button>

            {(productFilter || typeFilter || dateFrom || dateTo) && (
              <button 
                onClick={handleResetFilters}
                className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant font-body text-sm font-medium px-3 h-9 transition-colors flex items-center space-x-1 border border-outline-variant rounded-none"
                title="Reset Filters"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {isListLoading ? (
          <Spinner />
        ) : (
        <>
        {/* Data Table */}
        <div className="bg-surface border border-outline-variant overflow-hidden shadow-sm rounded-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-body">Product</th>
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-body">Qty</th>
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-body">Type</th>
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-body">Reason / Ref</th>
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-body">Created By</th>
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-body">Timestamp</th>
                </tr>
              </thead>
              <tbody className="font-body text-sm divide-y divide-outline-variant">
                {data.map((movement, i) => (
                  <tr key={movement.id} className={`${i % 2 !== 0 ? 'bg-surface-container-low ' : ''}hover:bg-surface-container transition-colors group`}>
                    <td className="px-5 py-4">
                      <div className="font-medium text-on-surface">{movement.product?.name}</div>
                      <div className="text-xs text-on-surface-variant">SKU: {movement.product?.sku}</div>
                    </td>
                    <td className={`px-5 py-4 font-mono font-medium ${movement.type === 'IN' ? 'text-tertiary' : 'text-error'}`}>
                      {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        movement.type === 'IN' 
                          ? 'bg-tertiary-container text-on-tertiary-container' 
                          : 'bg-error-container text-on-error-container'
                      }`}>
                        {movement.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-on-surface">{movement.reason}</div>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant">{movement.createdBy?.name || 'System'}</td>
                    <td className="px-5 py-4 text-on-surface-variant whitespace-nowrap">
                      {new Date(movement.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-on-surface-variant">
                      No stock movements found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="bg-surface-container px-5 py-3 border-t border-outline-variant flex items-center justify-between">
            <span className="text-sm text-on-surface-variant font-body">Showing {startItem} to {endItem} of {total} entries</span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 text-outline hover:text-on-surface disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-6 h-6 flex items-center justify-center rounded bg-primary text-on-primary text-xs font-medium">{page}</button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1 text-on-surface hover:bg-surface-container-high rounded disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Modal matching Carbon ERP aesthetic */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface max-w-lg w-full shadow-lg border border-outline-variant overflow-hidden flex flex-col rounded-none">
            <div className="px-8 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="text-xl font-semibold text-on-surface font-headline tracking-tight">Record Stock Movement</h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface active:opacity-80 transition-colors">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider font-body">Product <span className="text-error">*</span></label>
                <div className="relative">
                  <select 
                    required
                    name="productId"
                    value={formData.productId}
                    onChange={handleFormChange}
                    className="appearance-none w-full bg-surface-container border-b border-outline-variant focus:border-primary px-3 py-2 text-sm font-body text-on-surface h-10 focus:ring-0 rounded-none border-t-0 border-l-0 border-r-0"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg">arrow_drop_down</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider font-body">Type <span className="text-error">*</span></label>
                  <div className="relative">
                    <select 
                      required
                      name="type"
                      value={formData.type}
                      onChange={handleFormChange}
                      className="appearance-none w-full bg-surface-container border-b border-outline-variant focus:border-primary px-3 py-2 text-sm font-body text-on-surface h-10 focus:ring-0 rounded-none border-t-0 border-l-0 border-r-0"
                    >
                      <option value="IN">IN (+)</option>
                      <option value="OUT">OUT (-)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg">arrow_drop_down</span>
                  </div>
                </div>
                <div className="flex flex-col relative">
                  <label className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider font-body">Quantity <span className="text-error">*</span></label>
                  <input 
                    required
                    type="number"
                    min="1"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    className={`w-full bg-surface-container border-b ${inlineError ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'} px-3 py-2 text-sm font-body text-on-surface h-10 focus:ring-0 rounded-none border-t-0 border-l-0 border-r-0`}
                  />
                  {/* Inline Error for insufficient stock */}
                  {inlineError && (
                    <div className="absolute -bottom-5 left-0 flex items-center text-error text-xs font-medium font-body">
                      <span className="material-symbols-outlined text-[14px] mr-1">error</span>
                      {inlineError}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider font-body">Reason / Reference <span className="text-error">*</span></label>
                <input 
                  required
                  name="reason"
                  value={formData.reason}
                  onChange={handleFormChange}
                  className="w-full bg-surface-container border-b border-outline-variant focus:border-primary px-3 py-2 text-sm font-body text-on-surface h-10 focus:ring-0 rounded-none border-t-0 border-l-0 border-r-0"
                  placeholder="e.g. Sales Fulfillment, New stock arrived"
                />
              </div>

              <div className="pt-6 flex justify-end gap-4 border-t border-outline-variant">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-10 px-6 text-sm font-medium font-body text-on-surface hover:bg-surface-container-high border border-outline-variant transition-colors shadow-sm rounded-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="h-10 px-6 text-sm font-medium font-body bg-primary hover:bg-on-primary-fixed-variant text-on-primary transition-colors disabled:opacity-50 shadow-sm rounded-none flex items-center justify-center min-w-[150px]"
                >
                  {loading ? 'Saving...' : 'Save Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
