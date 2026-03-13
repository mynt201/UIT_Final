import { api } from '../plugins/axios';

export interface IndicatorThreshold {
  _id: string;
  indicator_id: { _id: string; code: string; name: string } | string;
  unit_id: { _id: string; name: string } | string;
  x_min: number;
  x_max: number;
  /** Đơn vị đo (ví dụ: m, mm, %) */
  unit?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IndicatorThresholdCreatePayload {
  indicator_id: string;
  unit_id: string;
  x_min: number;
  x_max: number;
  unit?: string;
}

export interface GetIndicatorThresholdsParams {
  unit_id?: string;
  indicator_id?: string;
}

export const indicatorThresholdService = {
  async getList(params?: GetIndicatorThresholdsParams) {
    const res = await api.get('/indicator-thresholds', { params });
    return res.data as { success: boolean; data: IndicatorThreshold[] };
  },

  async getById(id: string) {
    const res = await api.get(`/indicator-thresholds/${id}`);
    return res.data as { success: boolean; data: IndicatorThreshold };
  },

  async create(payload: IndicatorThresholdCreatePayload) {
    const res = await api.post('/indicator-thresholds', payload);
    return res.data as { success: boolean; data: IndicatorThreshold };
  },

  async update(id: string, payload: { x_min?: number; x_max?: number; unit?: string }) {
    const res = await api.put(`/indicator-thresholds/${id}`, payload);
    return res.data as { success: boolean; data: IndicatorThreshold };
  },

  async delete(id: string) {
    const res = await api.delete(`/indicator-thresholds/${id}`);
    return res.data as { success: boolean; message: string };
  },
};
