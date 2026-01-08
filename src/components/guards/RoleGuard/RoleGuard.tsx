// components/guards/RoleGuard.tsx
import type { JSX } from 'react';

type Props = {
  children: JSX.Element;
};

const RoleGuard = ({ children }: Props) => {
  return children;
};

export default RoleGuard;


