import React, { useState, useEffect } from 'react';
import type { User, CreateUserPayload, UpdateUserPayload } from '../../../api/users';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => void;
  initialData?: User | null;
  isLoading?: boolean;
}

export function UserFormModal({ isOpen, onClose, onSubmit, initialData, isLoading }: UserFormModalProps) {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState<CreateUserPayload>({
    name: '',
    email: '',
    password: '',
    role: 'SALES',
  });
  
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          email: initialData.email,
          role: initialData.role,
          password: '',
        });
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'SALES',
        });
      }
      setShowPassword(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      const updatePayload: UpdateUserPayload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      onSubmit(updatePayload);
    } else {
      onSubmit(formData as CreateUserPayload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#161616]/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-lg shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex flex-col animate-[slideIn_0.2s_ease-out]">
        
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <h2 className="text-xl font-semibold tracking-tight text-on-surface">
            {isEdit ? 'Edit User' : 'Add User'}
          </h2>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors" 
            type="button"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>
        
        <div className="p-6 bg-surface">
          <form id="userForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="text-[12px] text-[#525252] mb-1 display-block font-body" htmlFor="userName">Full Name</label>
              <input 
                id="userName" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full h-10 px-4 text-sm bg-[#f4f4f4] border-0 border-b border-[#8d8d8d] text-[#161616] focus:ring-0 focus:border-primary focus:border-b-2 transition-all" 
                placeholder="e.g. Jane Doe" 
                required 
                type="text" 
              />
            </div>
            
            <div>
              <label className="text-[12px] text-[#525252] mb-1 display-block font-body" htmlFor="userEmail">Email Address</label>
              <input 
                id="userEmail" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full h-10 px-4 text-sm bg-[#f4f4f4] border-0 border-b border-[#8d8d8d] text-[#161616] focus:ring-0 focus:border-primary focus:border-b-2 transition-all" 
                placeholder="jane.doe@example.com" 
                required 
                type="email" 
              />
            </div>
            
            {!isEdit && (
              <div>
                <label className="text-[12px] text-[#525252] mb-1 display-block font-body" htmlFor="userPassword">Temporary Password</label>
                <div className="relative">
                  <input 
                    id="userPassword" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full h-10 pl-4 pr-10 text-sm bg-[#f4f4f4] border-0 border-b border-[#8d8d8d] text-[#161616] focus:ring-0 focus:border-primary focus:border-b-2 transition-all" 
                    placeholder="Enter password" 
                    required 
                    type={showPassword ? "text" : "password"} 
                    minLength={6}
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-[#8d8d8d] hover:text-[#161616] transition-colors" 
                    type="button"
                  >
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#525252] mt-1">Must be at least 6 characters long.</p>
              </div>
            )}
            
            <div>
              <label className="text-[12px] text-[#525252] mb-1 display-block font-body" htmlFor="userRole">System Role</label>
              <div className="relative">
                <select 
                  id="userRole" 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as User['role']})}
                  className="w-full h-10 px-4 text-sm bg-[#f4f4f4] border-0 border-b border-[#8d8d8d] text-[#161616] focus:ring-0 focus:border-primary focus:border-b-2 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SALES">Sales</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="ACCOUNTS">Accounts</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2 text-[#8d8d8d] pointer-events-none" style={{ fontSize: '24px' }}>arrow_drop_down</span>
              </div>
            </div>
          </form>
        </div>
        
        <div className="px-6 py-4 bg-[#e0e0e0] border-t border-[#e0e0e0] flex justify-end gap-4 mt-auto">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="bg-transparent text-[#0f62fe] border border-[#0f62fe] h-12 px-6 text-sm hover:bg-[#0f62fe] hover:text-white transition-all disabled:opacity-50 min-w-[120px]" 
            type="button"
          >
            Cancel
          </button>
          <button 
            form="userForm"
            disabled={isLoading}
            className="bg-[#0f62fe] text-white h-12 px-6 text-sm hover:bg-[#0043ce] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 min-w-[120px] flex items-center justify-center" 
            type="submit"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
