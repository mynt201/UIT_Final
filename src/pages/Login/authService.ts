import type {
  User,
  AuthData,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
  UpdateUserProfileData,
  UserWithPassword,
} from "../../types";
import { MOCK_USERS } from "../../mockData";

const STORAGE_KEY = "auth";
const USERS_STORAGE_KEY = "mock_users";

// User Management Functions
export const getAllUsers = (): User[] => {
  const storedUsers = getStoredUsers();
  return storedUsers.map(({ password, ...user }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = password;
    return user;
  });
};

export const getUserById = (id: string): User | null => {
  const storedUsers = getStoredUsers();
  const user = storedUsers.find((u) => u.id === id);
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = password;
  return userWithoutPassword;
};

export const createUser = async (userData: {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  fullName?: string;
  phone?: string;
  address?: string;
}): Promise<User> => {
  await delay(300);
  const storedUsers = getStoredUsers();

  // Check if username or email already exists
  if (storedUsers.some((u) => u.username === userData.username)) {
    throw new Error("Tên người dùng đã tồn tại");
  }
  if (storedUsers.some((u) => u.email === userData.email)) {
    throw new Error("Email đã tồn tại");
  }

  const newUser: UserWithPassword = {
    id: Date.now().toString(),
    username: userData.username,
    email: userData.email,
    password: userData.password,
    role: userData.role,
    fullName: userData.fullName,
    phone: userData.phone,
    address: userData.address,
    createdAt: new Date().toISOString(),
    lastLogin: undefined,
  };

  storedUsers.push(newUser as (typeof storedUsers)[0]);
  saveUsers(storedUsers);

  const { password, ...userWithoutPassword } = newUser;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = password;
  return userWithoutPassword;
};

export const updateUser = async (
  id: string,
  userData: Partial<Omit<User, "id" | "createdAt">> & { password?: string },
): Promise<User> => {
  await delay(300);
  const storedUsers = getStoredUsers();
  const userIndex = storedUsers.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    throw new Error("Người dùng không tồn tại");
  }

  // Check if username or email already exists (excluding current user)
  if (userData.username) {
    if (
      storedUsers.some((u) => u.id !== id && u.username === userData.username)
    ) {
      throw new Error("Tên người dùng đã tồn tại");
    }
  }
  if (userData.email) {
    if (storedUsers.some((u) => u.id !== id && u.email === userData.email)) {
      throw new Error("Email đã tồn tại");
    }
  }

  const currentUser = storedUsers[userIndex];
  const updatedUser: UserWithPassword = {
    ...currentUser,
    ...userData,
    password:
      userData.password !== undefined
        ? userData.password
        : currentUser.password,
    lastLogin: currentUser.lastLogin,
  };

  storedUsers[userIndex] = updatedUser as (typeof storedUsers)[0];
  saveUsers(storedUsers);

  const { password, ...userWithoutPassword } = updatedUser;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = password;
  return userWithoutPassword;
};

export const deleteUser = async (id: string): Promise<void> => {
  await delay(300);
  const storedUsers = getStoredUsers();
  const filteredUsers = storedUsers.filter((u) => u.id !== id);

  if (filteredUsers.length === storedUsers.length) {
    throw new Error("Người dùng không tồn tại");
  }

  saveUsers(filteredUsers);
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredUsers = (): UserWithPassword[] => {
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

const saveUsers = (users: UserWithPassword[]): void => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const login = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  const { username, password } = credentials;

  await delay(500);

  const storedUsers = getStoredUsers();
  const user = storedUsers.find(
    (u) =>
      (u.username === username || u.email === username) &&
      u.password === password,
  );

  if (!user) {
    throw new Error("Tài khoản hoặc mật khẩu không đúng");
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

export const hasRole = (role: "admin" | "user"): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};

export const isAdmin = (): boolean => {
  return hasRole("admin");
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

export const register = async (
  credentials: RegisterCredentials,
): Promise<RegisterResponse> => {
  const { username, email, password } = credentials;

  await delay(500);

  const storedUsers = getStoredUsers();

  const existingUser = storedUsers.find(
    (u) => u.username === username || u.email === email,
  );

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error("Email đã được sử dụng");
    }
    if (existingUser.username === username) {
      throw new Error("Tên người dùng đã được sử dụng");
    }
  }

  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    role: "user" as const,
    password,
    fullName: "",
    phone: "",
    address: "",
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

export const updateUserProfile = async (
  userId: string,
  updates: UpdateUserProfileData,
): Promise<User> => {
  await delay(500);

  const storedUsers = getStoredUsers();
  const userIndex = storedUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error("Người dùng không tồn tại");
  }

  const currentUser = storedUsers[userIndex];

  if (updates.email && updates.email !== currentUser.email) {
    const emailExists = storedUsers.find(
      (u) => u.email === updates.email && u.id !== userId,
    );
    if (emailExists) {
      throw new Error("Email đã được sử dụng");
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
