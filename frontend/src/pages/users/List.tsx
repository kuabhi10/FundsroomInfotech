import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { usersApi } from '../../api/users';
import type { User, CreateUserPayload, UpdateUserPayload } from '../../api/users';
import { UserFormModal } from './components/UserFormModal';
import { ConfirmModal } from './components/ConfirmModal';

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async (p = page, l = limit, s = search) => {
    try {
      const res = await usersApi.getUsers({ page: p, limit: l, search: s });
      setUsers(res.data);
      setTotal(res.total);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch users');
    }
  };

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1, limit, query);
    }, 500);
  }, [limit]);

  useEffect(() => {
    fetchUsers(page, limit, search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  const openAddModal = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const openStatusConfirm = (user: User) => {
    setSelectedUser(user);
    setIsConfirmOpen(true);
  };

  const handleFormSubmit = async (data: CreateUserPayload | UpdateUserPayload) => {
    setIsSaving(true);
    try {
      if (selectedUser) {
        await usersApi.updateUser(selectedUser.id, data as UpdateUserPayload);
        toast.success('User updated successfully');
      } else {
        await usersApi.createUser(data as CreateUserPayload);
        toast.success('User created successfully');
      }
      setIsFormOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      await usersApi.updateUserStatus(selectedUser.id, !selectedUser.isActive);
      toast.success(`User ${!selectedUser.isActive ? 'activated' : 'deactivated'} successfully`);
      setIsConfirmOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update user status');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="font-body text-[#161616]">
      {/* Page Header */}
      <div className="px-6 py-8 md:px-8 max-w-[1600px] mx-auto bg-[#ffffff]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-light leading-tight text-[#161616] mb-1 font-headline">Users & Roles</h1>
            <p className="text-sm text-[#525252]">Manage system access, assign roles, and control user activity.</p>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-[#0f62fe] hover:bg-[#0043ce] text-white font-medium h-[48px] px-6 inline-flex items-center justify-center transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0f62fe] focus:ring-offset-2"
          >
            <span className="material-symbols-outlined mr-2 text-[20px]">add</span>
            Add User
          </button>
        </div>

        {/* Toolbar / Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 bg-[#f4f4f4] p-4">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#525252] text-[20px]">search</span>
            <input 
              value={search}
              onChange={handleSearchChange}
              className="w-full h-10 pl-10 pr-4 text-sm bg-transparent border-0 border-b border-[#8d8d8d] text-[#161616] focus:ring-0 focus:border-[#0f62fe] focus:border-b-2" 
              placeholder="Search by name or email" 
              type="search" 
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto bg-[#ffffff] border-t border-[#e0e0e0]">
          <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#e0e0e0] bg-[#ffffff] text-[#161616] font-semibold h-[48px]">
                <th className="px-4 align-middle w-1/4">Name</th>
                <th className="px-4 align-middle w-1/4">Email Address</th>
                <th className="px-4 align-middle w-1/6">Role</th>
                <th className="px-4 align-middle w-1/6">Status</th>
                <th className="px-4 align-middle text-right w-1/6">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[#161616]">
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  className={`h-[48px] border-b border-[#e0e0e0] even:bg-[#ffffff] odd:bg-[#f4f4f4] hover:bg-[#e0e0e0] transition-colors group ${!user.isActive ? 'text-[#525252]' : ''}`}
                >
                  <td className="px-4 align-middle font-medium">{user.name}</td>
                  <td className={`px-4 align-middle ${!user.isActive ? '' : 'text-[#525252]'}`}>{user.email}</td>
                  <td className="px-4 align-middle">
                    <span className={`bg-[#ffffff] border border-[#e0e0e0] px-2 py-1 text-xs ${!user.isActive ? 'opacity-70' : 'text-[#161616]'}`}>
                      {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 align-middle">
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={user.isActive} 
                          onChange={() => openStatusConfirm(user)}
                        />
                        <div className={`w-8 h-4 rounded-full relative transition-all ${user.isActive ? 'bg-[#198038]' : 'bg-[#8d8d8d]'} after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-[12px] after:w-[12px] after:transition-all ${user.isActive ? 'after:translate-x-[100%] after:border-white' : ''}`}></div>
                      </label>
                      <span className="text-xs w-12">{user.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="px-4 align-middle text-right">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="text-[#0f62fe] hover:text-[#0043ce] font-medium text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0f62fe]"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#525252]">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#e0e0e0] py-3 text-sm text-[#161616] bg-[#ffffff]">
          <div className="flex items-center gap-4">
            <span className="text-[#525252]">Items per page:</span>
            <select 
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border-0 border-b border-[#e0e0e0] bg-transparent py-1 pr-6 focus:ring-0 focus:border-[#0f62fe] text-sm cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[#525252]">
              {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total} items
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center text-[#525252] hover:bg-[#e0e0e0] transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= total}
                className="w-8 h-8 flex items-center justify-center text-[#525252] hover:bg-[#e0e0e0] transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <UserFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleFormSubmit}
        initialData={selectedUser}
        isLoading={isSaving}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleStatusToggle}
        user={selectedUser}
        actionText={selectedUser?.isActive ? 'Deactivate' : 'Activate'}
        isDeactivating={selectedUser?.isActive ?? false}
      />
    </div>
  );
}
