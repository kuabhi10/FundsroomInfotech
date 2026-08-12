import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, getProduct, updateProduct } from '../../api/products';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/auth';
import { Spinner } from '../../components/ui/spinner';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  
  const { user } = useAuthStore();
  const canWrite = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  useEffect(() => {
    if (!canWrite) {
      toast.error('Unauthorized access');
      navigate('/products');
    }
  }, [canWrite, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minStockAlert: 0,
    location: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const fetchProduct = async () => {
        try {
          const response = await getProduct(id);
          const p = response.data;
          setFormData({
            name: p.name,
            sku: p.sku,
            category: p.category,
            unitPrice: Number(p.unitPrice),
            currentStock: p.currentStock,
            minStockAlert: p.minStockAlert,
            location: p.location,
          });
        } catch (error) {
          toast.error('Failed to fetch product details');
          navigate('/products');
        }
      };
      fetchProduct();
    }
  }, [isEdit, id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && id) {
        await updateProduct(id, formData);
        toast.success('Product updated successfully');
      } else {
        await createProduct(formData);
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit && !formData.name) {
    return <Spinner />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/products')}
            className="p-2 text-on-surface-variant hover:bg-surface-container rounded-DEFAULT transition-colors active:opacity-80 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h2 className="text-2xl font-semibold font-headline text-on-surface tracking-tight">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-sm text-on-surface-variant font-body mt-1">
              {isEdit ? 'Update product details.' : 'Enter details for the new product.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-outline-variant p-6 lg:p-8 space-y-8 shadow-sm">
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider font-body">Product Name <span className="text-error">*</span></label>
                <input 
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-surface-container border-b border-outline-variant focus:border-primary px-3 py-2 text-sm font-body text-on-surface h-10 focus:ring-0 rounded-none border-t-0 border-l-0 border-r-0" 
                  placeholder="Enter product name" 
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider font-body">SKU <span className="text-error">*</span></label>
                <input 
                  required
                  disabled={isEdit}
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="bg-surface-container border-b border-outline-variant focus:border-primary px-3 py-2 text-sm font-body text-on-surface h-10 focus:ring-0 rounded-none border-t-0 border-l-0 border-r-0 disabled:opacity-50 disabled:cursor-not-allowed" 
                  placeholder="Unique SKU code" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider font-body">Category <span className="text-error">*</span></label>
                <select 
                  required
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="appearance-none bg-surface-container border-b border-outline-variant focus:border-primary px-3 py-2 text-sm font-body text-on-surface h-10 focus:ring-0 rounded-none border-t-0 border-l-0 border-r-0"
                >
                  <option value="" disabled>Select category</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Services">Services</option>
                  <option value="Peripherals">Peripherals</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider font-body">Unit Price (₹) <span className="text-error">*</span></label>
                <input 
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  className="bg-surface-container border-b border-outline-variant focus:border-primary px-3 py-2 text-sm font-body text-on-surface h-10 focus:ring-0 rounded-none border-t-0 border-l-0 border-r-0" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider font-body">
                  Initial Stock {isEdit && '(Read-Only)'}
                </label>
                <input 
                  type="number"
                  min="0"
                  disabled={isEdit}
                  name="currentStock"
                  value={formData.currentStock}
                  onChange={handleChange}
                  className="bg-surface-container border-b border-outline-variant focus:border-primary px-3 py-2 text-sm font-body text-on-surface h-10 focus:ring-0 rounded-none border-t-0 border-l-0 border-r-0 disabled:opacity-50 disabled:cursor-not-allowed" 
                />
                {isEdit && (
                  <div className="mt-2 flex items-center text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] mr-1">info</span>
                    Adjust via Stock Movements
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider font-body">Min Stock Alert <span className="text-error">*</span></label>
                <input 
                  required
                  type="number"
                  min="0"
                  name="minStockAlert"
                  value={formData.minStockAlert}
                  onChange={handleChange}
                  className="bg-surface-container border-b border-outline-variant focus:border-primary px-3 py-2 text-sm font-body text-on-surface h-10 focus:ring-0 rounded-none border-t-0 border-l-0 border-r-0" 
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider font-body">Location / Bin <span className="text-error">*</span></label>
              <input 
                required
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="bg-surface-container border-b border-outline-variant focus:border-primary px-3 py-2 text-sm font-body text-on-surface h-10 focus:ring-0 rounded-none border-t-0 border-l-0 border-r-0" 
                placeholder="e.g. Warehouse A, Aisle 4" 
              />
            </div>

          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-outline-variant">
            <button 
              type="button"
              onClick={() => navigate('/products')}
              className="h-10 px-6 text-sm font-medium font-body text-on-surface hover:bg-surface-container-high border border-outline-variant transition-colors rounded-none shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="h-10 px-6 text-sm font-medium font-body bg-primary hover:bg-on-primary-fixed-variant text-on-primary transition-colors disabled:opacity-50 rounded-none shadow-sm flex items-center justify-center min-w-[140px]"
            >
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
