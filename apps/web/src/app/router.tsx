import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Accounts from '@/pages/Accounts';
import Transactions from '@/pages/Transactions';
import Reports from '@/pages/Reports';
import UsersManagement from '@/pages/UsersManagement';
import { ProfilePage } from '@/pages/ProfilePage';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import RequireAuth from '@/features/auth/RequireAuth';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <RequireAuth><Dashboard /></RequireAuth> },
      { path: 'accounts', element: <RequireAuth><Accounts /></RequireAuth> },
      { path: 'transactions', element: <RequireAuth><Transactions /></RequireAuth> },
      { path: 'reports', element: <RequireAuth><Reports /></RequireAuth> },
      { path: 'users', element: <RequireAuth><UsersManagement /></RequireAuth> },
      { path: 'profile', element: <RequireAuth><ProfilePage /></RequireAuth> }
    ]
  },
  { path: '*', element: <Navigate to="/" /> }
]);

export default router;
