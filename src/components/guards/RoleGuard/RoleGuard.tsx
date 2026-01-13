// components/guards/RoleGuard.tsx
import type { JSX } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { LOGIN_PATH } from '../../../router/routePath';

type Props = {
  children: JSX.Element;
  requiredRole?: 'admin' | 'user';
};

const RoleGuard = ({ children, requiredRole = 'admin' }: Props) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log('RoleGuard Debug:', {
    isLoading,
    isAuthenticated,
    user: user ? { role: user.role, email: user.email, _id: user._id } : null,
    requiredRole,
    currentPath: location.pathname
  });

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('RoleGuard: User not authenticated, redirecting to login');
    return <Navigate to={LOGIN_PATH} state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (user.role !== requiredRole) {
    console.log('RoleGuard: User role mismatch', { userRole: user.role, requiredRole });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h2>
          <p className="text-gray-600 mb-4">
            Bạn không có quyền truy cập vào trang này.
          </p>
          <p className="text-sm text-gray-500">
            Yêu cầu role: <strong>{requiredRole}</strong> | Role hiện tại: <strong>{user.role}</strong>
          </p>
        </div>
      </div>
    );
  }

  console.log('RoleGuard: Access granted');
  return children;
};

export default RoleGuard;


