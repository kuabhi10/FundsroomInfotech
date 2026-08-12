import type { User } from '../../../api/users';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
  actionText: string;
  isDeactivating: boolean;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, user, actionText, isDeactivating }: ConfirmModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#161616]/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-sm shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex flex-col animate-[slideIn_0.2s_ease-out]">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <h2 className="text-xl font-semibold tracking-tight text-on-surface">Confirm Action</h2>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>
        
        <div className="p-6 bg-surface text-sm text-on-surface">
          <p>
            Are you sure you want to {isDeactivating ? 'deactivate' : 'activate'} user <strong>{user.name}</strong>?
          </p>
          {isDeactivating && (
            <p className="mt-2 text-on-surface-variant text-xs">
              They will not be able to log in to the system while deactivated.
            </p>
          )}
        </div>

        <div className="px-6 py-4 bg-surface-container border-t border-outline-variant flex justify-end gap-4 mt-auto">
          <button 
            onClick={onClose}
            className="bg-transparent text-primary border border-primary h-10 px-6 text-sm hover:bg-primary hover:text-white transition-colors"
            type="button"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`${isDeactivating ? 'bg-[#da1e28] hover:bg-[#ba1b23]' : 'bg-primary hover:bg-primary-fixed-variant'} text-white h-10 px-6 text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
            type="button"
          >
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
}
