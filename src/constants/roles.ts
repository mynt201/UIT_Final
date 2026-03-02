/**
 * User roles - dùng chung cho toàn bộ frontend
 */
export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  WARD_ADMIN: 'WARD_ADMIN',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

/** Dùng cho filter (all + các role) */
export type RoleFilterType = 'all' | UserRoleType;

export const ROLE_LABELS: Record<UserRoleType, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.WARD_ADMIN]: 'Quản lý phường',
};

/** Options cho Select (filter/form) */
export const ROLE_OPTIONS = [
  { value: UserRole.SUPER_ADMIN, label: ROLE_LABELS[UserRole.SUPER_ADMIN] },
  { value: UserRole.WARD_ADMIN, label: ROLE_LABELS[UserRole.WARD_ADMIN] },
] as const;

export const ADMIN_ROLES: UserRoleType[] = [UserRole.SUPER_ADMIN, UserRole.WARD_ADMIN];

export const getRoleLabel = (role: UserRoleType | string): string =>
  ROLE_LABELS[role as UserRoleType] ?? String(role);
