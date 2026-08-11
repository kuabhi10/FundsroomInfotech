import { createBrowserRouter } from 'react-router-dom';

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
  { path: '/dashboard', element: <Dashboard /> },
  
  // Customers Module
  { path: '/customers', element: <CustomerList /> },
  { path: '/customers/new', element: <CustomerForm /> },
  { path: '/customers/:id', element: <CustomerDetail /> },
  { path: '/customers/:id/edit', element: <CustomerForm /> },
  
  // Products & Inventory Module
  { path: '/products', element: <ProductList /> },
  { path: '/products/new', element: <ProductForm /> },
  { path: '/products/:id/edit', element: <ProductForm /> },
  { path: '/stock-movements', element: <StockMovements /> },
  
  // Sales Challan Module
  { path: '/challans', element: <ChallanList /> },
  { path: '/challans/new', element: <ChallanForm /> },
  { path: '/challans/:id', element: <ChallanDetail /> },
  { path: '/challans/:id/edit', element: <ChallanForm /> },
  
  // Invoice Module
  { path: '/invoices', element: <InvoiceList /> },
  { path: '/invoices/:id', element: <InvoiceDetail /> },
  
  // Users/Roles Module
  { path: '/users', element: <UserList /> },
  
  { path: '*', element: <div>404 Not Found</div> },
]);
