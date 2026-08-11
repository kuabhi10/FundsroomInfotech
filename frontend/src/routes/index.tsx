import { createBrowserRouter, Navigate } from 'react-router-dom';

import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';

import Dashboard from '../pages/dashboard';
import Login from '../pages/auth/Login';

import CustomerList from '../pages/customers/List';
import CustomerForm from '../pages/customers/Form';
import CustomerDetail from '../pages/customers/Detail';

import ProductList from '../pages/products/List';
import ProductForm from '../pages/products/Form';
import StockMovements from '../pages/stockMovements/List';

import ChallanList from '../pages/challans/List';
import ChallanForm from '../pages/challans/Form';
import ChallanDetail from '../pages/challans/Detail';

import InvoiceList from '../pages/invoices/List';
import InvoiceDetail from '../pages/invoices/Detail';

import UserList from '../pages/users/List';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      
      // Customers Module: Admin, Sales
      { path: 'customers', element: <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}><CustomerList /></ProtectedRoute> },
      { path: 'customers/new', element: <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}><CustomerForm /></ProtectedRoute> },
      { path: 'customers/:id', element: <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}><CustomerDetail /></ProtectedRoute> },
      { path: 'customers/:id/edit', element: <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}><CustomerForm /></ProtectedRoute> },
      
      // Products & Inventory Module: Admin, Warehouse
      { path: 'products', element: <ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><ProductList /></ProtectedRoute> },
      { path: 'products/new', element: <ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><ProductForm /></ProtectedRoute> },
      { path: 'products/:id/edit', element: <ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><ProductForm /></ProtectedRoute> },
      { path: 'stock-movements', element: <ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><StockMovements /></ProtectedRoute> },
      
      // Sales Challan Module: Admin, Sales, Warehouse
      { path: 'challans', element: <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE']}><ChallanList /></ProtectedRoute> },
      { path: 'challans/new', element: <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE']}><ChallanForm /></ProtectedRoute> },
      { path: 'challans/:id', element: <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE']}><ChallanDetail /></ProtectedRoute> },
      { path: 'challans/:id/edit', element: <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE']}><ChallanForm /></ProtectedRoute> },
      
      // Invoice Module: Admin, Sales, Accounts
      { path: 'invoices', element: <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}><InvoiceList /></ProtectedRoute> },
      { path: 'invoices/:id', element: <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}><InvoiceDetail /></ProtectedRoute> },
      
      // Users/Roles Module: Admin
      { path: 'users', element: <ProtectedRoute allowedRoles={['ADMIN']}><UserList /></ProtectedRoute> },
      
      { path: '*', element: <div>404 Not Found</div> },
    ],
  },
]);
