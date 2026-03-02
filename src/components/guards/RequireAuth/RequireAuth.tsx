import type { JSX } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { LOGIN_PATH } from '../../../router/routePath';

type Props = {
  children: JSX.Element;
};

export default function RequireAuth({ children }: Props) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang kiểm tra...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={LOGIN_PATH} state={{ from: location }} replace />;
  }

  return children;
}
