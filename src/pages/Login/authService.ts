export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  fullName?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
  lastLogin?: string;
  avatar?: string;
}

export interface AuthData {
  token: string;
  user: User;
  expiresAt?: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

const STORAGE_KEY = 'auth';
const USERS_STORAGE_KEY = 'mock_users';

const MOCK_USERS = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin' as const,
    password: '123456',
    fullName: 'Quản trị viên',
    phone: '0123456789',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    createdAt: new Date('2024-01-01').toISOString(),
    lastLogin: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'user',
    email: 'user@example.com',
    role: 'user' as const,
    password: '123456',
    fullName: 'Người dùng',
    phone: '0987654321',
    address: '456 Đường XYZ, Quận 2, TP.HCM',
    createdAt: new Date('2024-01-15').toISOString(),
    lastLogin: new Date().toISOString(),
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredUsers = (): typeof MOCK_USERS => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
  } catch {
    return MOCK_USERS;
  }
};

const saveUsers = (users: typeof MOCK_USERS): void => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const { username, password } = credentials;

  await delay(500);

  const storedUsers = getStoredUsers();
  const user = storedUsers.find(
    (u) => (u.username === username || u.email === username) && u.password === password
  );

  if (!user) {
    throw new Error('Tài khoản hoặc mật khẩu không đúng');
  }

  // Update lastLogin
  const userIndex = storedUsers.findIndex((u) => u.id === user.id);
  if (userIndex !== -1) {
    storedUsers[userIndex] = {
      ...storedUsers[userIndex],
      lastLogin: new Date().toISOString(),
    };
    saveUsers(storedUsers);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: userPassword, ...userWithoutPassword } = {
    ...user,
    lastLogin: new Date().toISOString(),
  };
  const token = `token-${user.id}-${Date.now()}`;

  const authData: AuthData = {
    token,
    user: userWithoutPassword,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

  return {
    token,
    user: userWithoutPassword,
  };
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getCurrentUser = (): User | null => {
  try {
    const authDataString = localStorage.getItem(STORAGE_KEY);
    if (!authDataString) {
      return null;
    }

    const authData: AuthData = JSON.parse(authDataString);

    if (authData.expiresAt && Date.now() > authData.expiresAt) {
      logout();
      return null;
    }

    return authData.user;
  } catch {
    return null;
  }
};

export const getToken = (): string | null => {
  try {
    const authDataString = localStorage.getItem(STORAGE_KEY);
    if (!authDataString) {
      return null;
    }

    const authData: AuthData = JSON.parse(authDataString);

    if (authData.expiresAt && Date.now() > authData.expiresAt) {
      logout();
      return null;
    }

    return authData.token;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const user = getCurrentUser();
  return user !== null;
};

export const hasRole = (role: 'admin' | 'user'): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};

export const isAdmin = (): boolean => {
  return hasRole('admin');
};

export const refreshAuth = (): AuthData | null => {
  try {
    const authDataString = localStorage.getItem(STORAGE_KEY);
    if (!authDataString) {
      return null;
    }

    const authData: AuthData = JSON.parse(authDataString);

    if (authData.expiresAt && Date.now() > authData.expiresAt) {
      logout();
      return null;
    }

    return authData;
  } catch {
    return null;
  }
};

export const register = async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
  const { username, email, password } = credentials;

  await delay(500);

  const storedUsers = getStoredUsers();

  const existingUser = storedUsers.find((u) => u.username === username || u.email === email);

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error('Email đã được sử dụng');
    }
    if (existingUser.username === username) {
      throw new Error('Tên người dùng đã được sử dụng');
    }
  }

  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    role: 'user' as const,
    password,
    fullName: '',
    phone: '',
    address: '',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  const updatedUsers = [...storedUsers, newUser];
  saveUsers(updatedUsers);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: userPassword, ...userWithoutPassword } = newUser;
  const token = `token-${newUser.id}-${Date.now()}`;

  const authData: AuthData = {
    token,
    user: userWithoutPassword,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

  return {
    token,
    user: userWithoutPassword,
  };
};

export interface UpdateUserProfileData {
  fullName?: string;
  phone?: string;
  address?: string;
  email?: string;
}

export const updateUserProfile = async (
  userId: string,
  updates: UpdateUserProfileData
): Promise<User> => {
  await delay(500);

  const storedUsers = getStoredUsers();
  const userIndex = storedUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error('Người dùng không tồn tại');
  }

  const currentUser = storedUsers[userIndex];

  if (updates.email && updates.email !== currentUser.email) {
    const emailExists = storedUsers.find((u) => u.email === updates.email && u.id !== userId);
    if (emailExists) {
      throw new Error('Email đã được sử dụng');
    }
  }

  const updatedUser = {
    ...currentUser,
    ...updates,
  };

  storedUsers[userIndex] = updatedUser;
  saveUsers(storedUsers);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: userPassword, ...userWithoutPassword } = updatedUser;

  const authData = refreshAuth();
  if (authData && authData.user.id === userId) {
    const updatedAuthData: AuthData = {
      ...authData,
      user: userWithoutPassword,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAuthData));
  }

  return userWithoutPassword;
};
