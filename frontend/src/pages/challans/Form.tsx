import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { customersApi, productsApi, challansApi } from '../../api';
import type { Customer } from '../../types/customer';
import type { Product } from '../../types/product';
import { toast } from 'sonner';

interface ChallanItemInput {
  productId: string;
  quantity: number;
  product?: Product;
}

export default function ChallanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<ChallanItemInput[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Extra fields just for UI matching (not saved in backend)
  const [referenceNum, setReferenceNum] = useState('');
  const [dispatchThrough, setDispatchThrough] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [transportCharges, setTransportCharges] = useState(0);
  const [discount, setDiscount] = useState(0);
  
  const [lineErrors, setLineErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      customersApi.getCustomers({ limit: 100 }),
      productsApi.getProducts({ limit: 100 })
    ]).then(([custRes, prodRes]) => {
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    });

    if (isEdit && id) {
      challansApi.getChallanById(id).then(data => {
        setCustomerId(data.customerId);
        if (data.items) {
          setItems(data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })));
        }
      });
    } else {
      // Initialize with one empty row
      setItems([{ productId: '', quantity: 1 }]);
    }
  }, [id, isEdit]);

  // Derive products for items
  const mappedItems = items.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  });

  const subtotal = mappedItems.reduce((acc, item) => {
    if (item.product && item.quantity > 0) {
      return acc + (Number(item.product.unitPrice) * item.quantity);
    }
    return acc;
  }, 0);
  
  const grandTotal = subtotal + transportCharges - discount;

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ChallanItemInput, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    // clear error for this line if any
    setLineErrors(prev => {
      const pId = newItems[index].productId;
      if (pId && prev[pId]) {
        const next = { ...prev };
        delete next[pId];
        return next;
      }
      return prev;
    });
  };

  const submit = async (status: 'DRAFT' | 'CONFIRMED') => {
    try {
      setLineErrors({});
      if (!customerId) {
        toast.error('Please select a customer');
        return;
      }
      const validItems = items.filter(i => i.productId && i.quantity > 0);
      if (validItems.length === 0) {
        toast.error('Please add at least one valid item');
        return;
      }

      const payload = {
        customerId,
        status,
        items: validItems.map(i => ({ productId: i.productId, quantity: Number(i.quantity) }))
      };

      setLoading(true);
      if (isEdit && id) {
        if (status === 'DRAFT') {
          await challansApi.updateChallan(id, payload);
          toast.success('Draft updated');
          navigate(`/challans/${id}`);
        } else {
          // Confirming an existing draft
          await challansApi.updateChallan(id, { customerId: payload.customerId, items: payload.items });
          await challansApi.confirmChallan(id);
          toast.success('Challan confirmed');
          navigate(`/challans/${id}`);
        }
      } else {
        const res = await challansApi.createChallan(payload);
        toast.success(`Challan ${status.toLowerCase()}`);
        navigate(`/challans/${res.id}`);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message;
      const details = err.response?.data?.details;
      
      if (details?.productId) {
        setLineErrors({
          [details.productId]: `Requested: ${details.requested}, Available: ${details.available}`
        });
        toast.error('Insufficient stock for one or more items');
      } else {
        toast.error('Operation failed', { description: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-surface pb-24 md:pb-8 flex flex-col min-h-screen">
      {/* Header Section */}
      <div className="border-b border-outline-variant bg-surface px-6 py-6 md:px-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => navigate('/challans')} className="text-on-surface-variant text-sm hover:text-primary transition-colors flex items-center">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Challans
            </button>
          </div>
          <h2 className="text-2xl font-semibold font-headline text-on-surface">
            {isEdit ? 'Edit Draft Challan' : 'Create New Challan'}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">Draft a new delivery challan to dispatch goods to a customer.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            disabled={loading}
            onClick={() => submit('DRAFT')}
            className="flex-1 sm:flex-none px-4 py-2 border border-primary text-primary hover:bg-surface-container-highest font-medium text-sm rounded-DEFAULT transition-colors min-h-[40px] disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button 
            disabled={loading}
            onClick={() => submit('CONFIRMED')}
            className="flex-1 sm:flex-none px-4 py-2 bg-primary text-on-primary hover:bg-primary/90 font-medium text-sm rounded-DEFAULT transition-colors min-h-[40px] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Confirm Challan
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details & Items */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* General Information Card */}
          <section className="bg-surface-container rounded-DEFAULT p-6 border border-outline-variant">
            <h3 className="text-lg font-semibold font-headline mb-4 pb-2 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">info</span>
              Challan Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Select */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-on-surface flex justify-between">
                  Customer <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={customerId}
                    onChange={e => setCustomerId(e.target.value)}
                    className="w-full bg-surface border-b border-outline-variant h-10 px-3 text-sm focus:border-primary focus:ring-0 focus:outline-none appearance-none rounded-none cursor-pointer"
                  >
                    <option disabled value="">Select a customer...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.businessName}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>
              
              {/* Challan Date (Visual) */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-on-surface">Challan Date</label>
                <div className="relative">
                  <input className="w-full bg-surface border-b border-outline-variant h-10 px-3 text-sm focus:border-primary focus:ring-0 focus:outline-none rounded-none text-on-surface-variant" type="date" value={new Date().toISOString().split('T')[0]} readOnly />
                </div>
              </div>
              
              {/* Reference Number */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-on-surface">Reference Number (PO / SO)</label>
                <input 
                  value={referenceNum} onChange={e => setReferenceNum(e.target.value)}
                  className="w-full bg-surface border-b border-outline-variant h-10 px-3 text-sm focus:border-primary focus:ring-0 focus:outline-none rounded-none" placeholder="e.g. PO-2023-089" type="text" />
              </div>
              
              {/* Dispatch Through */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-on-surface">Dispatch Through</label>
                <input 
                  value={dispatchThrough} onChange={e => setDispatchThrough(e.target.value)}
                  className="w-full bg-surface border-b border-outline-variant h-10 px-3 text-sm focus:border-primary focus:ring-0 focus:outline-none rounded-none" placeholder="e.g. FedEx, BlueDart, Own Vehicle" type="text" />
              </div>
            </div>
            
            <div className="mt-6 flex flex-col gap-2">
              <label className="text-sm font-medium text-on-surface">Delivery Address</label>
              <textarea 
                value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
                className="w-full bg-surface border-b border-outline-variant px-3 py-2 text-sm focus:border-primary focus:ring-0 focus:outline-none rounded-none resize-none" placeholder="Enter complete delivery address..." rows={2} />
            </div>
          </section>

          {/* Line Items Section */}
          <section className="bg-surface-container rounded-DEFAULT border border-outline-variant overflow-hidden">
            <div className="p-6 pb-4 border-b border-outline-variant flex justify-between items-center bg-surface-container">
              <h3 className="text-lg font-semibold font-headline flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant">inventory_2</span>
                Line Items
              </h3>
              <button 
                onClick={handleAddItem}
                className="text-sm font-medium text-primary hover:text-primary-fixed-dim flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Row
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface-dim border-b border-outline-variant">
                  <tr>
                    <th className="px-4 py-3 font-medium text-on-surface w-12">#</th>
                    <th className="px-4 py-3 font-medium text-on-surface min-w-[250px]">Product / Item Description</th>
                    <th className="px-4 py-3 font-medium text-on-surface w-24 text-right">Qty</th>
                    <th className="px-4 py-3 font-medium text-on-surface w-32 text-right">Rate</th>
                    <th className="px-4 py-3 font-medium text-on-surface w-32 text-right">Total</th>
                    <th className="px-4 py-3 font-medium text-on-surface w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant bg-surface">
                  {mappedItems.map((item, index) => (
                    <React.Fragment key={index}>
                      <tr className="group hover:bg-surface-container transition-colors">
                        <td className="px-4 py-3 text-on-surface-variant">{index + 1}</td>
                        <td className="px-4 py-3">
                          <select 
                            value={item.productId}
                            onChange={e => handleItemChange(index, 'productId', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent group-hover:border-outline-variant h-8 px-1 text-sm focus:border-primary focus:ring-0 focus:outline-none rounded-none cursor-pointer"
                          >
                            <option disabled value="">Select Product...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            className="w-full text-right bg-transparent border-b border-transparent group-hover:border-outline-variant h-8 px-1 text-sm focus:border-primary focus:ring-0 focus:outline-none rounded-none" 
                            min="1" 
                            type="number" 
                            value={item.quantity}
                            onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-on-surface-variant">
                          {item.product ? `$${Number(item.product.unitPrice).toFixed(2)}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-on-surface">
                          {item.product ? `$${(Number(item.product.unitPrice) * item.quantity).toFixed(2)}` : '0.00'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => handleRemoveItem(index)}
                            className="text-on-surface-variant hover:text-error transition-colors p-1" title="Remove Item"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </td>
                      </tr>
                      {item.productId && lineErrors[item.productId] && (
                        <tr>
                          <td colSpan={6} className="px-4 py-2 bg-error-container text-on-error-container text-xs font-medium border-t-0">
                            Error: {lineErrors[item.productId]}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Notes Section */}
          <section className="bg-surface-container rounded-DEFAULT p-6 border border-outline-variant">
            <h3 className="text-lg font-semibold font-headline mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">edit_note</span>
              Terms &amp; Notes
            </h3>
            <div className="flex flex-col gap-2">
              <textarea 
                value={notes} onChange={e => setNotes(e.target.value)}
                className="w-full bg-surface border-b border-outline-variant px-3 py-2 text-sm focus:border-primary focus:ring-0 focus:outline-none rounded-none resize-none" placeholder="Add any special instructions..." rows={3} />
            </div>
          </section>

        </div>

        {/* Right Column: Summary Panel */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container rounded-DEFAULT border border-outline-variant p-6 sticky top-24">
            <h3 className="text-lg font-semibold font-headline mb-4 pb-4 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">summarize</span>
              Summary
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Subtotal ({mappedItems.filter(i => i.product).length} items)</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-on-surface-variant">Transport Charges</span>
                <input 
                  type="number" value={transportCharges} onChange={e => setTransportCharges(Number(e.target.value) || 0)}
                  className="w-24 text-right bg-surface border-b border-outline-variant h-6 px-1 text-sm focus:border-primary focus:outline-none rounded-none" />
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-on-surface-variant">Discount</span>
                <input 
                  type="number" value={discount} onChange={e => setDiscount(Number(e.target.value) || 0)}
                  className="w-24 text-right bg-surface border-b border-outline-variant h-6 px-1 text-sm focus:border-primary focus:outline-none rounded-none text-error" />
              </div>
            </div>
            
            <div className="border-t border-outline-variant pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold">Grand Total</span>
                <span className="text-xl font-bold text-primary font-headline">${grandTotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-on-surface-variant text-right mt-1">Currency: USD</p>
            </div>
            
            {/* Action Block */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => submit('CONFIRMED')} disabled={loading}
                className="w-full px-4 py-3 bg-primary text-on-primary hover:bg-primary/90 font-medium text-sm rounded-DEFAULT transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">send</span>
                Save &amp; Confirm
              </button>
              <button 
                onClick={() => submit('DRAFT')} disabled={loading}
                className="w-full px-4 py-3 border border-outline text-on-surface hover:bg-surface-container-highest font-medium text-sm rounded-DEFAULT transition-colors disabled:opacity-50"
              >
                Save as Draft
              </button>
            </div>
            
            <div className="mt-6 p-3 bg-surface border border-outline-variant rounded text-xs text-on-surface-variant flex gap-2">
              <span className="material-symbols-outlined text-base">lightbulb</span>
              <p>A confirmed challan will automatically reduce available stock quantity for the selected items.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
