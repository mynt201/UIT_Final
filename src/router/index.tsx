import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import UserLayout from '../components/layout/UserLayout';
import RoleGuard from '../components/guards/RoleGuard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { LOGIN_PATH, REGISTER_PATH } from './routePath';

export const router = createBrowserRouter([
  {
    path: '/admin',
    element: (
      <RoleGuard allowRoles={['admin']}>
        <AdminLayout />
      </RoleGuard>
    ),
    children: [],
  },
  {
    path: '/',
    element: <UserLayout />,
    children: [],
  },
  {
    path: LOGIN_PATH,
    element: <Login />,
  },
  {
    path: REGISTER_PATH,
    element: <Register />,
  },
]);
