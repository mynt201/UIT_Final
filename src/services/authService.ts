import { api } from '../plugins/axios';
import type { LoginCredentials, RegisterCredentials, User, AuthData } from '../types/auth';

// Authentication API calls
export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthData> {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },

  // Register user
  async register(credentials: RegisterCredentials): Promise<AuthData> {
    const response = await api.post('/users/register', credentials);
    return response.data;
  },

  // Get current user profile
  async getProfile(): Promise<{ user: User }> {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<{ user: User }> {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  // Change password
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await api.put('/users/change-password', data);
    return response.data;
  },

  // Get all users with advanced search and filters (Admin only)
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string; // Single role or comma-separated multiple roles
    isActive?: boolean;
    search?: string; // Search in username, email, fullName, phone, address
    sort?: string; // createdAt, updatedAt, username, email, fullName, name, lastLogin
    order?: 'asc' | 'desc';
    createdFrom?: string; // ISO date string
    createdTo?: string; // ISO date string
    lastLoginFrom?: string; // ISO date string
    lastLoginTo?: string; // ISO date string
  }): Promise<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      nextPage: number | null;
      prevPage: number | null;
    };
    filters: {
      search: string | null;
      role: string | null;
      isActive: string | null;
      createdFrom: string | null;
      createdTo: string | null;
      lastLoginFrom: string | null;
      lastLoginTo: string | null;
    };
    sort: {
      by: string;
      order: string;
    };
  }> {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get user by ID (Admin only)
  async getUserById(id: string): Promise<{ user: User }> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update user (Admin only)
  async updateUser(id: string, userData: Partial<User>): Promise<{ user: User }> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user (Admin only)
  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Get user statistics (Admin only)
  async getUserStats(): Promise<{
    stats: {
      totalUsers: number;
      activeUsers: number;
      adminUsers: number;
      recentUsers: number;
    };
  }> {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Create admin user (Admin only)
  async createAdminUser(userData: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
    address?: string;
  }): Promise<{ user: User }> {
    const response = await api.post('/users/create-admin', userData);
    return response.data;
  },
};
