import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../api/products';
import type { Product } from '../../types/product';
import { useAuthStore } from '../../store/auth';

export default function ProductList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  // Allow ADMIN and WAREHOUSE. Hide for SALES and ACCOUNTS.
  const canWrite = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const [data, setData] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStock, setLowStock] = useState(false);
  
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts({
          search: debouncedSearch || undefined,
          category: category || undefined,
          lowStock: lowStock || undefined,
          page,
          limit,
        });
        setData(response.data);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to fetch products', error);
      }
    };
    fetchProducts();
  }, [debouncedSearch, category, lowStock, page]);

  const totalPages = Math.ceil(total / limit) || 1;
  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold font-headline text-on-surface tracking-tight">Products</h2>
            <p className="text-sm text-on-surface-variant font-body mt-1">Manage your inventory catalogue and stock levels.</p>
          </div>
          {canWrite && (
            <button 
              onClick={() => navigate('/products/new')}
              className="flex items-center space-x-2 bg-primary text-on-primary hover:bg-[#0043ce] transition-colors px-4 py-2 rounded shadow-sm text-sm font-medium font-body h-10 min-w-[120px] justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Product</span>
            </button>
          )}
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-surface-container-low p-4 rounded-sm flex flex-col md:flex-row gap-4 items-center justify-between border border-outline-variant">
          <div className="flex-1 w-full flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-surface border-none focus:ring-1 focus:ring-primary text-sm font-body text-on-surface placeholder:text-on-surface-variant transition-colors rounded-none shadow-sm" 
                placeholder="Search by Name or SKU..." 
                style={{ borderBottom: '1px solid #e0e0e0' }}
                type="text" 
              />
            </div>
            <div className="relative w-48">
              <select 
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="w-full h-10 pl-3 pr-8 bg-surface border-none focus:ring-1 focus:ring-primary text-sm font-body text-on-surface appearance-none rounded-none shadow-sm" 
                style={{ borderBottom: '1px solid #e0e0e0' }}
              >
                <option value="">Filter by Category (All)</option>
                {/* Normally we'd dynamically fetch categories, using some hardcoded for now or an empty string */}
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Services">Services</option>
                <option value="Peripherals">Peripherals</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">arrow_drop_down</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm font-body text-on-surface w-full md:w-auto">
            <label className="flex items-center cursor-pointer select-none" htmlFor="low-stock-toggle">
              <div className="relative">
                <input 
                  id="low-stock-toggle"
                  type="checkbox" 
                  checked={lowStock}
                  onChange={(e) => { setLowStock(e.target.checked); setPage(1); }}
                  className="sr-only peer" 
                />
                <div className="block w-10 h-6 rounded-full bg-surface-container-highest peer-checked:bg-primary transition-colors"></div>
                <div className="dot absolute left-1 top-1 bg-surface w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4 shadow-sm"></div>
              </div>
              <span className="ml-3 font-medium">Show Low Stock Only</span>
            </label>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface border border-outline-variant overflow-hidden rounded-sm shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm whitespace-nowrap">
              <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3" scope="col">Product Name</th>
                  <th className="px-4 py-3" scope="col">SKU</th>
                  <th className="px-4 py-3" scope="col">Category</th>
                  <th className="px-4 py-3 text-right" scope="col">Unit Price</th>
                  <th className="px-4 py-3" scope="col">Current Stock</th>
                  <th className="px-4 py-3" scope="col">Location</th>
                  <th className="px-4 py-3 text-right" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-on-surface">
                {data.map((product) => {
                  const isLowStock = product.currentStock <= product.minStockAlert;
                  const isOutOfStock = product.currentStock === 0;

                  return (
                    <tr 
                      key={product.id} 
                      className={`${isLowStock && !isOutOfStock ? 'bg-surface-variant ' : ''}hover:bg-surface-container-low transition-colors group cursor-pointer`}
                      onClick={() => navigate(canWrite ? `/products/${product.id}/edit` : `/products`)}
                    >
                      <td className="px-4 py-3 font-medium text-on-surface flex items-center gap-2">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{product.sku}</td>
                      <td className="px-4 py-3 text-on-surface-variant capitalize">{product.category}</td>
                      <td className="px-4 py-3 text-right">₹{Number(product.unitPrice).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isOutOfStock ? (
                            <>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-error text-on-error">0</span>
                              <span className="material-symbols-outlined text-error text-[16px]" title="Out of Stock">error</span>
                            </>
                          ) : isLowStock ? (
                            <>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-error-container text-error border border-[#ffb3b8]">{product.currentStock}</span>
                              <span className="material-symbols-outlined text-error text-[16px]" title="Low Stock Warning">warning</span>
                            </>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-surface-container text-on-surface">{product.currentStock}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{product.location || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canWrite && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}/edit`); }}
                              className="text-primary hover:text-[#0043ce] p-1 rounded hover:bg-primary-fixed transition-colors" 
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/stock-movements?productId=${product.id}`); }}
                            className="text-primary hover:text-[#0043ce] p-1 rounded hover:bg-primary-fixed transition-colors" 
                            title="View Stock Log"
                          >
                            <span className="material-symbols-outlined text-[18px]">history</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-on-surface-variant">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 bg-surface border-t border-outline-variant text-sm font-body text-on-surface-variant">
            <div>
              Showing <span className="font-medium text-on-surface">{startItem}</span> to <span className="font-medium text-on-surface">{endItem}</span> of <span className="font-medium text-on-surface">{total}</span> results
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-outline-variant bg-surface hover:bg-surface-container-low disabled:opacity-50 transition-colors rounded-sm" 
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 border border-outline-variant bg-surface hover:bg-surface-container-low transition-colors rounded-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
