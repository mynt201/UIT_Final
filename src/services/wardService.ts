import { api } from '../plugins/axios';
import type { WardData } from '../types/ward';

export interface WardQueryParams {
  page?: number;
  limit?: number;
  district?: string;
  province?: string;
  risk_level?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface WardPaginationResponse {
  wards: WardData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface WardStatsResponse {
  statistics: {
    totalWards: number;
    avgRisk: number;
    maxRisk: number;
    avgRainfall: number;
    avgElevation: number;
    avgDrainage: number;
    totalPopulation: number;
  };
  riskDistribution: Array<{
    label: string;
    count: number;
    percentage: number;
  }>;
}

export interface BulkImportResponse {
  message: string;
  results: {
    successful: Array<{ id: string; ward_name: string }>;
    failed: Array<{ ward_name: string; error: string }>;
    duplicates: Array<{ ward_name: string; reason: string }>;
  };
}

// Ward API calls
export const wardService = {
  // Get all wards with pagination and filtering
  async getWards(params?: WardQueryParams): Promise<WardPaginationResponse> {
    const response = await api.get('/wards', { params });
    return response.data;
  },

  // Get ward by ID
  async getWardById(id: string): Promise<{ ward: WardData }> {
    const response = await api.get(`/wards/${id}`);
    return response.data;
  },

  // Get ward by name
  async getWardByName(name: string): Promise<{ ward: WardData }> {
    const response = await api.get(`/wards/name/${encodeURIComponent(name)}`);
    return response.data;
  },

  // Create new ward (Admin only)
  async createWard(
    wardData: Omit<WardData, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ ward: WardData }> {
    const response = await api.post('/wards', wardData);
    return response.data;
  },

  // Update ward (Admin only)
  async updateWard(id: string, wardData: Partial<WardData>): Promise<{ ward: WardData }> {
    const response = await api.put(`/wards/${id}`, wardData);
    return response.data;
  },

  // Delete ward (Admin only)
  async deleteWard(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/wards/${id}`);
    return response.data;
  },

  // Calculate flood risk for a ward (Admin only)
  async calculateRisk(id: string): Promise<{ ward: WardData }> {
    const response = await api.post(`/wards/${id}/calculate-risk`);
    return response.data;
  },

  // Get wards by risk level
  async getWardsByRiskLevel(level: string): Promise<{
    count: number;
    wards: WardData[];
  }> {
    const response = await api.get(`/wards/risk/${encodeURIComponent(level)}`);
    return response.data;
  },

  // Get ward statistics
  async getWardStats(): Promise<WardStatsResponse> {
    const response = await api.get('/wards/stats');
    return response.data;
  },

  // Bulk import wards (Admin only)
  async bulkImportWards(
    wards: Omit<WardData, '_id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<BulkImportResponse> {
    const response = await api.post('/wards/bulk-import', { wards });
    return response.data;
  },
};
