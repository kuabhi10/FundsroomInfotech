import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challansApi } from '../../api';
import type { Challan } from '../../api/challans';
import { toast } from 'sonner';

export default function ChallanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChallan = async () => {
    try {
      if (!id) return;
      setLoading(true);
      const data = await challansApi.getChallanById(id);
      setChallan(data);
    } catch (error: any) {
      toast.error('Failed to load challan', { description: error.response?.data?.error || error.message });
      navigate('/challans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this challan? This will revert stock.')) return;
    try {
      if (!id) return;
      await challansApi.cancelChallan(id);
      toast.success('Challan cancelled');
      fetchChallan();
    } catch (err: any) {
      toast.error('Cancellation failed', { description: err.response?.data?.error || err.message });
    }
  };

  const handleConfirm = async () => {
    if (!window.confirm('Are you sure you want to confirm this challan? This will deduct stock.')) return;
    try {
      if (!id) return;
      await challansApi.confirmChallan(id);
      toast.success('Challan confirmed');
      fetchChallan();
    } catch (err: any) {
      const details = err.response?.data?.details;
      if (details?.productId) {
        toast.error('Insufficient stock', { description: `Requested: ${details.requested}, Available: ${details.available}`});
      } else {
        toast.error('Confirmation failed', { description: err.response?.data?.error || err.message });
      }
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      if (!id) return;
      // using dynamic import for invoicesApi since it's not imported at the top, or I can import it at the top. Wait, let me import it at the top.
      const { invoicesApi } = await import('../../api');
      const invoice = await invoicesApi.createInvoice(id);
      toast.success('Invoice generated successfully');
      navigate(`/invoices/${invoice.id}`);
    } catch (err: any) {
      toast.error('Failed to generate invoice', { description: err.response?.data?.error || err.message });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant">Loading challan details...</div>;
  }

  if (!challan) return null;

  const isDraft = challan.status === 'DRAFT';
  const isConfirmed = challan.status === 'CONFIRMED';

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => navigate('/challans')} className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Challans
              </button>
            </div>
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-on-surface tracking-tight">{challan.challanNumber}</h2>
              {isConfirmed ? (
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-tertiary-container text-on-tertiary-container border border-tertiary-fixed-dim/30 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Confirmed
                </span>
              ) : challan.status === 'CANCELLED' ? (
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-error-container text-on-error-container border border-error/30 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">cancel</span>
                  Cancelled
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-surface-container-highest text-on-surface border border-outline-variant uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">draft</span>
                  Draft
                </span>
              )}
            </div>
            <p className="text-sm text-on-surface-variant mt-1">Created on {new Date(challan.createdAt).toLocaleString()}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {isDraft && (
              <>
                <button 
                  onClick={() => navigate(`/challans/${challan.id}/edit`)}
                  className="px-4 py-2 border border-outline text-on-surface bg-surface hover:bg-surface-container transition-colors rounded text-sm font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Edit
                </button>
                <button 
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-primary text-on-primary hover:bg-primary/90 transition-colors rounded text-sm font-medium flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Confirm Challan
                </button>
              </>
            )}
            {isConfirmed && (
              <>
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 border border-error text-error bg-surface hover:bg-error-container transition-colors rounded text-sm font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  Cancel Challan
                </button>
                <button 
                  onClick={handleGenerateInvoice}
                  className="px-4 py-2 bg-primary text-on-primary hover:bg-primary/90 transition-colors rounded text-sm font-medium flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">receipt_long</span>
                  Generate Invoice
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Details */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Customer Card */}
            <div className="bg-surface-container rounded p-5 border border-outline-variant">
              <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-4 border-b border-outline-variant pb-2">Customer Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">Company Name</p>
                  <p className="text-sm font-medium text-on-surface">
                    {challan.customerSnapshot?.businessName || challan.customer?.businessName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">Contact Person</p>
                  <p className="text-sm font-medium text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
                    {challan.customerSnapshot?.name || challan.customer?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">Contact</p>
                  <p className="text-sm text-on-surface leading-relaxed">
                    {challan.customerSnapshot?.mobile || challan.customer?.mobile}
                  </p>
                </div>
              </div>
            </div>
            
          </div>

          {/* Right Column: Line Items */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-surface rounded border border-outline-variant overflow-hidden">
              <div className="p-5 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
                <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider">Line Items</h3>
                <span className="text-xs font-medium bg-surface-container px-2 py-1 rounded border border-outline-variant text-on-surface-variant">
                  {challan.items?.length || 0} Items
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-on-surface-variant bg-surface-container border-b border-outline-variant uppercase">
                    <tr>
                      <th className="px-6 py-3 font-medium">SKU / Description</th>
                      <th className="px-6 py-3 font-medium text-right">Qty Disp.</th>
                      <th className="px-6 py-3 font-medium text-right">Unit Price</th>
                      <th className="px-6 py-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {challan.items?.map((item: any) => (
                      <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-on-surface">{item.productSnapshot?.name}</div>
                          <div className="text-xs text-on-surface-variant mt-0.5">{item.productSnapshot?.sku}</div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-on-surface">{item.quantity}</td>
                        <td className="px-6 py-4 text-right text-on-surface-variant">${Number(item.productSnapshot?.unitPrice || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-medium text-on-surface">${Number(item.lineTotal || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-6 bg-surface-container-lowest border-t border-outline-variant flex justify-end">
                <div className="w-full md:w-1/2 space-y-3">
                  <div className="flex justify-between text-base font-semibold text-on-surface">
                    <span>Total Value</span>
                    <span>${Number(challan.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}
