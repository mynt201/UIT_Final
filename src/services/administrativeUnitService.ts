import { api } from '../plugins/axios';

export interface AdministrativeUnitGeom {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[] | number[][][] | number[][][][];
}

export interface AdministrativeUnit {
  _id: string;
  name: string;
  geom: AdministrativeUnitGeom;
  area_km2: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdministrativeUnitCreatePayload {
  name: string;
  geom?: AdministrativeUnitGeom;
  area_km2?: number;
}

export interface AdministrativeUnitUpdatePayload {
  name?: string;
  geom?: AdministrativeUnitGeom;
  area_km2?: number;
}

export interface GetUnitsParams {
  page?: number;
  limit?: number;
  name?: string;
}

export interface GetUnitsResponse {
  success: boolean;
  data: AdministrativeUnit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const administrativeUnitService = {
  /** GET /administrative-units - paginated, filter by name */
  async getUnits(params?: GetUnitsParams): Promise<GetUnitsResponse> {
    const response = await api.get('/administrative-units', { params });
    return response.data;
  },

  /** GET /administrative-units/all - all units (no pagination) */
  async getAllUnits(): Promise<{ success: boolean; data: AdministrativeUnit[] }> {
    const response = await api.get('/administrative-units/all');
    return response.data;
  },

  /** GET /administrative-units/:id */
  async getUnitById(id: string): Promise<{ success: boolean; data: AdministrativeUnit }> {
    const response = await api.get(`/administrative-units/${id}`);
    return response.data;
  },

  /** POST /administrative-units - SUPER_ADMIN only */
  async createUnit(
    payload: AdministrativeUnitCreatePayload
  ): Promise<{ success: boolean; data: AdministrativeUnit }> {
    const response = await api.post('/administrative-units', payload);
    return response.data;
  },

  /** PUT /administrative-units/:id - SUPER_ADMIN only */
  async updateUnit(
    id: string,
    payload: AdministrativeUnitUpdatePayload
  ): Promise<{ success: boolean; data: AdministrativeUnit }> {
    const response = await api.put(`/administrative-units/${id}`, payload);
    return response.data;
  },

  /** DELETE /administrative-units/:id - SUPER_ADMIN only */
  async deleteUnit(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/administrative-units/${id}`);
    return response.data;
  },
};
