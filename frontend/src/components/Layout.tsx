import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { label: 'Customers', icon: 'groups', path: '/customers', roles: ['ADMIN', 'SALES'] },
    { label: 'Products', icon: 'inventory_2', path: '/products', roles: ['ADMIN', 'WAREHOUSE'] },
    { label: 'Stock Movements', icon: 'swap_horiz', path: '/stock-movements', roles: ['ADMIN', 'WAREHOUSE'] },
    { label: 'Sales Challans', icon: 'description', path: '/challans', roles: ['ADMIN', 'SALES', 'WAREHOUSE'] },
    { label: 'Invoices', icon: 'receipt_long', path: '/invoices', roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { label: 'Users & Roles', icon: 'admin_panel_settings', path: '/users', roles: ['ADMIN'] },
  ];

  const visibleNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#161616' }} className="flex h-screen overflow-hidden font-sans">
      {/* SideNavBar */}
      <nav 
        style={{ backgroundColor: '#f4f4f4', borderColor: '#e0e0e0' }} 
        className="fixed left-0 top-0 h-full flex flex-col pt-8 pb-4 z-40 border-r w-64"
      >
        <div className="px-6 mb-8 flex items-center space-x-3">
          <span style={{ color: '#0f62fe', fontVariationSettings: "'FILL' 1" }} className="material-symbols-outlined text-3xl">
            dataset
          </span>
          <div>
            <h1 style={{ color: '#161616' }} className="text-lg font-bold tracking-tight">Carbon ERP</h1>
            <p style={{ color: '#525252' }} className="text-xs">Enterprise Operations</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={isActive ? { backgroundColor: '#ffffff', color: '#0f62fe', borderLeftColor: '#0f62fe' } : { color: '#525252' }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-sm text-sm font-medium transition-all ${
                  isActive ? 'border-l-4 font-semibold shadow-xs' : 'hover:bg-[#e0e0e0]'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
        <div style={{ borderColor: '#e0e0e0' }} className="px-4 mt-auto pt-4 border-t space-y-1">
          <div style={{ color: '#525252' }} className="flex items-center space-x-3 px-4 py-2 text-sm font-medium">
            <span className="material-symbols-outlined">contact_support</span>
            <span>Support</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col h-full bg-white">
        {/* TopNavBar */}
        <header 
          style={{ backgroundColor: '#ffffff', borderColor: '#e0e0e0' }} 
          className="flex justify-between items-center h-12 px-6 w-full z-50 border-b"
        >
          <div className="flex items-center w-1/3">
            <span style={{ color: '#525252' }} className="text-sm font-medium">
              Carbon Operations Portal
            </span>
          </div>
          <div className="flex items-center justify-end space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <span style={{ color: '#161616' }} className="font-medium">{user?.name}</span>
              <span style={{ backgroundColor: '#d0e2ff', color: '#001d6c' }} className="text-xs px-2 py-0.5 rounded uppercase font-semibold">
                {user?.role}
              </span>
            </div>
            <button 
              onClick={handleLogout} 
              style={{ color: '#da1e28' }} 
              className="text-sm font-medium hover:underline flex items-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm mr-1">logout</span>
              Logout
            </button>
          </div>
        </header>

        {/* Canvas */}
        <main style={{ backgroundColor: '#ffffff' }} className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
