import { api } from '../plugins/axios';
import type { RiskIndexData } from '../types/dataManagement';

export interface RiskQueryParams {
  page?: number;
  limit?: number;
  ward_id?: string;
  risk_category?: string;
  date_from?: string;
  date_to?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface RiskPaginationResponse {
  success: boolean;
  riskData: RiskIndexData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface RiskHistoryResponse {
  success: boolean;
  ward: {
    _id: string;
    ward_name: string;
    district: string;
  };
  riskHistory?: RiskIndexData[];
  count?: number;
}

// Risk API calls
export const riskService = {
  // Get risk index data with pagination and filtering
  async getRiskIndexData(params?: RiskQueryParams): Promise<RiskPaginationResponse> {
    const response = await api.get('/risk', { params });
    return response.data;
  },

  // Get risk data by ID
  async getRiskById(id: string): Promise<{ success: boolean; riskData: RiskIndexData }> {
    const response = await api.get(`/risk/${id}`);
    return response.data;
  },

  // Get risk history for a ward
  async getRiskHistoryByWard(
    wardId: string,
    limit?: number
  ): Promise<RiskHistoryResponse> {
    const response = await api.get(`/risk/ward/${wardId}`, {
      params: { limit },
    });
    return response.data;
  },

  // Get current risk levels for all wards
  async getCurrentRiskLevels(): Promise<{
    success: boolean;
    currentRiskLevels: RiskIndexData[];
    count: number;
  }> {
    const response = await api.get('/risk/current');
    return response.data;
  },
};
