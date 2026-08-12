import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomer, addCustomerNote } from '../../api/customers';
import type { Customer } from '../../types/customer';
import { useAuthStore } from '../../store/auth';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { Spinner } from '../../components/ui/spinner';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canWrite = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const fetchCustomer = async () => {
    if (!id) return;
    try {
      const response = await getCustomer(id);
      setCustomer(response.data);
    } catch (error) {
      console.error('Failed to fetch customer', error);
      toast.error('Failed to load customer details');
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !id) return;
    setIsSubmittingNote(true);
    try {
      const response = await addCustomerNote(id, newNote);
      // Response returns updated notes array
      setCustomer((prev) => prev ? { ...prev, notes: response.data } : null);
      setNewNote('');
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Failed to add note', error);
      toast.error('Failed to add note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  if (!customer) {
    return <Spinner />;
  }

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
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[var(--color-surface-container-lowest)] h-full">
      <div className="max-w-[1400px] w-full mx-auto flex flex-col gap-6">
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] tracking-tight font-headline">{customer.name}</h2>
            <p className="text-[var(--color-on-surface-variant)] mt-1 text-sm">Customer ID: {customer.id}</p>
          </div>
          <div className="flex items-center gap-3">
            {canWrite && (
              <button 
                onClick={() => navigate(`/customers/${customer.id}/edit`)}
                className="h-10 px-4 bg-[var(--color-surface)] border border-[var(--color-primary)] text-[var(--color-primary)] font-medium hover:bg-[var(--color-primary-container)] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Details
              </button>
            )}
            <button 
              onClick={() => navigate(`/challans/new?customerId=${customer.id}`)}
              className="h-10 px-4 bg-[var(--color-primary)] text-[var(--color-on-primary)] font-medium hover:bg-[var(--color-primary-fixed-dim)] transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Challan
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Customer Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Overview Card */}
            <div className="bg-[var(--color-surface-container)] p-6 shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--color-outline-variant)]">
                <h3 className="text-base font-semibold text-[var(--color-on-surface)]">Overview</h3>
                {getStatusBadge(customer.status)}
              </div>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs text-[var(--color-on-surface-variant)] font-medium">Business Name</dt>
                  <dd className="text-sm font-medium text-[var(--color-on-surface)] mt-0.5">{customer.businessName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-on-surface-variant)] font-medium">Customer Type</dt>
                  <dd className="text-sm text-[var(--color-on-surface)] mt-0.5 capitalize">{customer.customerType.toLowerCase()}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-on-surface-variant)] font-medium">GST Number</dt>
                  <dd className="text-sm text-[var(--color-on-surface)] mt-0.5 font-mono">{customer.gstNumber || 'N/A'}</dd>
                </div>
              </dl>
            </div>

            {/* Contact Info Card */}
            <div className="bg-[var(--color-surface-container)] p-6 shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--color-outline-variant)]">
                <h3 className="text-base font-semibold text-[var(--color-on-surface)]">Contact Information</h3>
                <span className="material-symbols-outlined text-[var(--color-on-surface-variant)] text-[20px]">contact_page</span>
              </div>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs text-[var(--color-on-surface-variant)] font-medium">Primary Contact</dt>
                  <dd className="text-sm font-medium text-[var(--color-on-surface)] mt-0.5">{customer.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-on-surface-variant)] font-medium">Email Address</dt>
                  <dd className="text-sm text-[var(--color-primary)] mt-0.5">{customer.email || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-on-surface-variant)] font-medium">Mobile Number</dt>
                  <dd className="text-sm text-[var(--color-on-surface)] mt-0.5">{customer.mobile}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-on-surface-variant)] font-medium">Billing Address</dt>
                  <dd className="text-sm text-[var(--color-on-surface)] mt-0.5 leading-relaxed whitespace-pre-wrap">{customer.address}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right Column: Activity & Data Tables */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Related Challans Table */}
            <div className="bg-[var(--color-surface)] shadow-[0_2px_6px_rgba(0,0,0,0.1)] flex flex-col">
              <div className="p-4 border-b border-[var(--color-outline-variant)] flex justify-between items-center bg-[var(--color-surface-container-low)]">
                <h3 className="text-base font-semibold text-[var(--color-on-surface)] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">description</span>
                  Recent Challans
                </h3>
              </div>
              <div className="overflow-x-auto p-4 text-center text-sm text-[var(--color-on-surface-variant)]">
                {customer.challans?.length ? (
                  /* Map through challans here in Phase 5 */
                  <div>Challans list will appear here.</div>
                ) : (
                  <div>No recent challans.</div>
                )}
              </div>
            </div>

            {/* Follow-up Notes Section */}
            <div className="bg-[var(--color-surface-container)] p-6 shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-2 mb-6 pb-2 border-b border-[var(--color-outline-variant)]">
                <span className="material-symbols-outlined text-[20px] text-[var(--color-on-surface-variant)]">forum</span>
                <h3 className="text-base font-semibold text-[var(--color-on-surface)]">Follow-up Notes</h3>
              </div>
              
              {/* Add Note Input */}
              {canWrite && (
                <div className="mb-6 flex gap-3">
                  <div className="w-8 h-8 bg-[var(--color-surface-container-highest)] flex-shrink-0 flex items-center justify-center text-xs font-bold text-[var(--color-on-surface-variant)] rounded-full mt-1">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 space-y-2">
                    <textarea 
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="w-full bg-[var(--color-surface)] border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] p-2 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] resize-none focus:outline-none transition-colors" 
                      placeholder="Add a new follow-up note..." 
                      rows={2}
                    ></textarea>
                    <div className="flex justify-end">
                      <button 
                        onClick={handleAddNote}
                        disabled={isSubmittingNote || !newNote.trim()}
                        className="h-8 px-4 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-xs font-medium hover:bg-[var(--color-primary-fixed-dim)] transition-colors disabled:opacity-50"
                      >
                        {isSubmittingNote ? 'Posting...' : 'Post Note'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Timeline */}
              <div className="space-y-4">
                {customer.notes && customer.notes.length > 0 ? (
                  customer.notes.map((note) => (
                    <div key={note.id} className="bg-[var(--color-surface)] p-4 border-l-2 border-[var(--color-primary)]">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-[var(--color-on-surface)]">{note.createdBy.name}</span>
                        </div>
                        <span className="text-xs text-[var(--color-on-surface-variant)]">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed whitespace-pre-wrap">
                        {note.note}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-[var(--color-on-surface-variant)] py-4">
                    No follow-up notes yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
