import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoicesApi } from '../../api';
import type { Invoice } from '../../api/invoices';
import { toast } from 'sonner';
import { Spinner } from '../../components/ui/spinner';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = async () => {
    try {
      if (!id) return;
      setLoading(true);
      const data = await invoicesApi.getInvoiceById(id);
      setInvoice(data);
    } catch (error: any) {
      toast.error('Failed to load invoice', { description: error.response?.data?.error || error.message });
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleDownloadPdf = () => {
    if (!id) return;
    
    // Simple download using window.open to hit the PDF endpoint
    // Assuming the user needs the token, an alternate way is using fetch/axios and downloading Blob.
    // We'll use axios to fetch with auth and create object URL.
    toast.promise(
      async () => {
        const responseData = await invoicesApi.downloadInvoicePdf(id);
        const url = window.URL.createObjectURL(new Blob([responseData], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice-${invoice?.invoiceNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      },
      {
        loading: 'Generating PDF...',
        success: 'PDF downloaded successfully!',
        error: 'Failed to download PDF',
      }
    );
  };

  if (loading) {
    return <Spinner />;
  }

  if (!invoice) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-surface-container-low flex flex-col h-full">
      {/* Page Header */}
      <div className="px-8 py-6 bg-surface border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold text-on-surface font-headline tracking-tight">{invoice.invoiceNumber}</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-tertiary-container text-on-tertiary-container border border-tertiary-fixed-dim rounded-sm uppercase tracking-wide">
              {invoice.status}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            Issued: {new Date(invoice.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/challans/${invoice.challanId}`)}
            className="h-10 px-4 border border-outline text-on-surface hover:bg-surface-container transition-colors text-sm font-medium rounded-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Challan
          </button>
          <button 
            onClick={handleDownloadPdf}
            className="h-10 px-4 bg-primary text-on-primary hover:bg-surface-tint transition-colors text-sm font-medium rounded-sm flex items-center gap-2 border border-transparent"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download PDF
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="p-8 flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Details & Items */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* Linked Reference Strip */}
          <div 
            onClick={() => navigate(`/challans/${invoice.challanId}`)}
            className="group bg-surface border border-outline-variant p-4 flex items-center justify-between hover:bg-surface-variant transition-colors cursor-pointer rounded-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">link</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide mb-0.5">Linked Document</p>
                <p className="text-sm font-medium text-primary group-hover:underline">Sales Challan #{invoice.challan?.challanNumber}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface transition-colors">chevron_right</span>
          </div>

          {/* Customer Details Bento */}
          <section className="bg-surface border border-outline-variant rounded-sm overflow-hidden">
            <div className="border-b border-outline-variant px-5 py-3 bg-surface-variant">
              <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wide">Customer Snapshot</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Bill To</p>
                <p className="text-base font-medium text-on-surface">{invoice.customer?.businessName || invoice.customer?.name}</p>
                <p className="text-sm text-on-surface mt-1 leading-relaxed">
                  {invoice.customer?.address || 'No address provided'}
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">Contact</p>
                  <p className="text-sm text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                    {invoice.customer?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">Tax ID / GST</p>
                  <p className="text-sm font-mono text-on-surface">{invoice.customer?.gstNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Line Items Table */}
          <section className="bg-surface border border-outline-variant rounded-sm overflow-hidden flex flex-col">
            <div className="border-b border-outline-variant px-5 py-3 bg-surface-variant flex justify-between items-center">
              <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wide">Line Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface">
                    <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider w-32">SKU</th>
                    <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Description</th>
                    <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right w-24">Qty</th>
                    <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right w-32">Unit Price</th>
                    <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right w-32">Total</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {invoice.challan?.items?.map((item: any, idx: number) => (
                    <tr key={item.id} className={`border-b border-outline-variant hover:bg-surface-variant transition-colors group ${idx % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'}`}>
                      <td className="px-5 py-3 font-mono text-on-surface-variant text-xs">{item.productSnapshot?.sku}</td>
                      <td className="px-5 py-3 text-on-surface font-medium">{item.productSnapshot?.name}</td>
                      <td className="px-5 py-3 text-on-surface text-right">{item.quantity}</td>
                      <td className="px-5 py-3 text-on-surface text-right">${Number(item.productSnapshot?.unitPrice).toFixed(2)}</td>
                      <td className="px-5 py-3 text-on-surface text-right font-medium">${Number(item.lineTotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* Right Column: Summary */}
        <div className="xl:col-span-4 flex flex-col gap-6 sticky top-6">
          <section className="bg-surface border border-outline-variant rounded-sm">
            <div className="border-b border-outline-variant px-5 py-4">
              <h2 className="text-base font-semibold text-on-surface font-headline">Invoice Summary</h2>
            </div>
            <div className="p-5 flex flex-col gap-4 text-sm">
              <div className="flex justify-between items-end">
                <span className="text-base font-semibold text-on-surface">Grand Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-on-surface font-headline block leading-none tracking-tight">${Number(invoice.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-outline-variant bg-surface-variant flex flex-col gap-3">
              <p className="text-xs text-on-surface-variant flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
                <span>Payment terms according to standard operational agreement.</span>
              </p>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
