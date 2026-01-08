export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
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
  email: string;
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

export interface UpdateUserProfileData {
  fullName?: string;
  phone?: string;
  address?: string;
  email?: string;
}

export type UserWithPassword = User & { password: string };

export interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

