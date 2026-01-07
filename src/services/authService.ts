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

  // Get all users (Admin only)
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
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
};
