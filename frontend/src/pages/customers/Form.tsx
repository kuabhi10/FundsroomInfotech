import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomer, createCustomer, updateCustomer } from '../../api/customers';
import type { Customer } from '../../types/customer';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL',
    address: '',
    status: 'LEAD',
    followUpDate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit && id) {
      getCustomer(id)
        .then((response) => {
          setFormData(response.data);
        })
        .catch((error) => {
          console.error(error);
          toast.error('Failed to load customer');
          navigate('/customers');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        email: formData.email?.trim() || null,
        gstNumber: formData.gstNumber?.trim() || null,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : null,
      };

      if (isEdit && id) {
        await updateCustomer(id, payload);
        toast.success('Customer updated successfully');
      } else {
        await createCustomer(payload);
        toast.success('Customer created successfully');
      }
      navigate('/customers');
    } catch (error: any) {
      console.error(error);
      const details = error.response?.data?.details;
      if (details && Array.isArray(details)) {
        const msg = details.map((d: any) => `${d.path.join('.')}: ${d.message}`).join(', ');
        toast.error(`Validation error: ${msg}`);
      } else {
        const msg = error.response?.data?.error || 'Failed to save customer';
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[var(--color-surface-container-lowest)] h-full">
      <div className="max-w-[800px] w-full mx-auto">
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-on-surface)] tracking-tight font-headline">
            {isEdit ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <p className="text-[var(--color-on-surface-variant)] mt-1 text-sm">
            {isEdit ? 'Update client details.' : 'Enter details for the new client.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] shadow-[0_2px_6px_rgba(0,0,0,0.1)] p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Basic Info */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-on-surface)]">Full Name *</label>
              <Input 
                name="name"
                value={formData.name || ''} 
                onChange={handleChange}
                required
                placeholder="e.g. Alice Freeman"
                className="bg-[var(--color-surface-container)]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-on-surface)]">Mobile *</label>
              <Input 
                name="mobile"
                value={formData.mobile || ''} 
                onChange={handleChange}
                required
                placeholder="+1 555-0000"
                className="bg-[var(--color-surface-container)]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-on-surface)]">Email</label>
              <Input 
                type="email"
                name="email"
                value={formData.email || ''} 
                onChange={handleChange}
                placeholder="alice@example.com"
                className="bg-[var(--color-surface-container)]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-on-surface)]">Business Name *</label>
              <Input 
                name="businessName"
                value={formData.businessName || ''} 
                onChange={handleChange}
                required
                placeholder="TechFlow Solutions"
                className="bg-[var(--color-surface-container)]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-on-surface)]">GST Number</label>
              <Input 
                name="gstNumber"
                value={formData.gstNumber || ''} 
                onChange={handleChange}
                placeholder="27AADCT..."
                className="bg-[var(--color-surface-container)]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-on-surface)]">Customer Type *</label>
              <select 
                name="customerType"
                value={formData.customerType || 'RETAIL'}
                onChange={handleChange}
                className="w-full h-8 pl-2 pr-4 bg-[var(--color-surface-container)] border-none text-sm focus:ring-1 focus:ring-[var(--color-primary)] font-body text-[var(--color-on-surface)] outline-none rounded-sm"
              >
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-on-surface)]">Status *</label>
              <select 
                name="status"
                value={formData.status || 'LEAD'}
                onChange={handleChange}
                className="w-full h-8 pl-2 pr-4 bg-[var(--color-surface-container)] border-none text-sm focus:ring-1 focus:ring-[var(--color-primary)] font-body text-[var(--color-on-surface)] outline-none rounded-sm"
              >
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-on-surface)]">Follow-up Date</label>
              <Input 
                type="date"
                name="followUpDate"
                value={formData.followUpDate ? formData.followUpDate.split('T')[0] : ''} 
                onChange={handleChange}
                className="bg-[var(--color-surface-container)]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[var(--color-on-surface)]">Billing Address *</label>
              <textarea 
                name="address"
                value={formData.address || ''} 
                onChange={handleChange}
                required
                rows={3}
                className="w-full bg-[var(--color-surface-container)] p-2 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] rounded-sm"
                placeholder="Full address..."
              ></textarea>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-outline-variant)]">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/customers')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-fixed-dim)]"
            >
              {isSubmitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Customer')}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
