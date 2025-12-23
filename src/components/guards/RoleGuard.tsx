import { Navigate, Outlet } from 'react-router-dom';

type Role = 'admin' | 'user';

type Props = {
  allowRoles: Role[];
};

const RoleGuard = ({ allowRoles }: Props) => {
  const authRaw = localStorage.getItem('auth');
  const auth = authRaw ? JSON.parse(authRaw) : null;

  // 1. Chưa login
  if (!auth?.token) {
    return <Navigate to='/login' replace />;
  }

  // 2. Sai role
  if (!allowRoles.includes(auth.role)) {
    return <Navigate to='/' replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
