// components/guards/RoleGuard.tsx
import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';

type Props = {
  allowRoles: Array<'admin' | 'user'>;
  children: JSX.Element;
};

const RoleGuard = ({ allowRoles, children }: Props) => {
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');

  // if (!auth) {
  //   return <Navigate to='/login' replace />;
  // }

  // if (!allowRoles.includes(auth.role)) {
  //   return <Navigate to='/403' replace />;
  // }

  return children;
};

export default RoleGuard;
