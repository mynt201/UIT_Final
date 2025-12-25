import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import UserLayout from '../components/layout/UserLayout';
import RoleGuard from '../components/guards/RoleGuard';

import Login from '../pages/Login';
import Register from '../pages/Register';

import { LOGIN_PATH, REGISTER_PATH } from './routePath';
import PageView from '../pages/PageView/Index';
import Index from '../pages/Dashboard';

export const router = createBrowserRouter([
  // ===== ADMIN PRIVATE =====
  {
    path: '/admin',
    element: (
      <RoleGuard allowRoles={['admin']}>
        <AdminLayout />
      </RoleGuard>
    ),
    children: [
      {
        index: true,
        element: <Index />,
      },
    ],
  },

  // ===== USER PRIVATE =====
  {
    path: '/',
    element: (
      <RoleGuard allowRoles={['user', 'admin']}>
        <UserLayout />
      </RoleGuard>
    ),
    children: [
      {
        index: true,
        element: <PageView />,
      },
    ],
  },

  // ===== AUTH PUBLIC =====
  {
    path: LOGIN_PATH,
    element: <Login />,
  },
  {
    path: REGISTER_PATH,
    element: <Register />,
  },
]);
