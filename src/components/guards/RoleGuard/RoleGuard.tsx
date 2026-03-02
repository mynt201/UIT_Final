// components/guards/RoleGuard.tsx
import type { JSX } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { LOGIN_PATH } from '../../../router/routePath';
import { ADMIN_ROLES } from '../../../constants/roles';

type Props = {
  children: JSX.Element;
  requiredRole?: string | string[];
};

const RoleGuard = ({ children, requiredRole = ADMIN_ROLES }: Props) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={LOGIN_PATH} state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h2>
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập vào trang này.</p>
          <p className="text-sm text-gray-500">
            Yêu cầu role: <strong>{allowedRoles.join(', ')}</strong> | Role hiện tại:{' '}
            <strong>{user.role}</strong>
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleGuard;


