import { api } from '../plugins/axios';

export interface FloodIndicator {
  _id: string;
  code: string;
  name: string;
  group_type: string;
  weight: number;
  unit?: string;
  /** 1 = thuận (giá trị cao = rủi ro cao), 0 = nghịch (giá trị cao = rủi ro thấp) */
  direction?: 0 | 1;
}

export interface IndicatorValueRecord {
  _id: string;
  unit_id: { _id: string; name: string } | string;
  indicator_id: { _id: string; code: string; name: string } | string;
  data_year: number;
  raw_value: number;
  normalized_value: number;
}

export interface GetIndicatorValuesParams {
  unit_id?: string;
  indicator_id?: string;
  year?: number;
  data_year?: number;
}

export const indicatorValueService = {
  async getValues(params?: GetIndicatorValuesParams) {
    const q: Record<string, string | number> = {};
    if (params?.unit_id) q.unit_id = params.unit_id;
    if (params?.indicator_id) q.indicator_id = params.indicator_id;
    const yr = params?.year ?? params?.data_year;
    if (yr != null) q.data_year = yr;
    const res = await api.get('/indicator-values', { params: q });
    return res.data as { success: boolean; data: IndicatorValueRecord[] };
  },

  async createValue(payload: {
    unit_id: string;
    indicator_id: string;
    data_year: number;
    raw_value: number;
    normalized_value?: number; // BE tự tính theo min-max và direction
  }) {
    const res = await api.post('/indicator-values', payload);
    return res.data as { success: boolean; data: IndicatorValueRecord };
  },

  async updateValue(
    id: string,
    payload: { raw_value?: number; normalized_value?: number }
  ) {
    const res = await api.put(`/indicator-values/${id}`, payload);
    return res.data as { success: boolean; data: IndicatorValueRecord };
  },

  async deleteValue(id: string) {
    const res = await api.delete(`/indicator-values/${id}`);
    return res.data as { success: boolean; message: string };
  },

  async bulkUpsert(
    items: Array<{
      unit_id: string;
      indicator_id: string;
      data_year: number;
      raw_value: number;
      normalized_value?: number; // BE tự tính theo min-max và direction
    }>
  ) {
    const res = await api.post('/indicator-values/bulk-upsert', { items });
    return res.data as { success: boolean; data: IndicatorValueRecord[]; count: number };
  },

  /** Tải template CSV - unit_id và year có thể là "all" cho tất cả */
  async downloadTemplate(unitId?: string | null, year?: number | string | null) {
    const params: Record<string, string | number> = {};
    params.unit_id = unitId && unitId !== '' ? unitId : 'all';
    params.year = year !== undefined && year !== '' && year !== null ? String(year) : 'all';
    const res = await api.get('/indicator-values/template', {
      params,
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ChiSoRuiRo_Template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export interface FloodIndicatorCreatePayload {
  code: string;
  name: string;
  group_type: string;
  weight: number;
  unit?: string;
  direction?: 0 | 1;
  description?: string;
}

export const floodIndicatorService = {
  async getIndicators() {
    const res = await api.get('/flood-indicators');
    return res.data as { success: boolean; data: FloodIndicator[] };
  },

  async createIndicator(payload: FloodIndicatorCreatePayload) {
    const res = await api.post('/flood-indicators', payload);
    return res.data as { success: boolean; data: FloodIndicator };
  },

  async updateIndicator(id: string, payload: Partial<FloodIndicatorCreatePayload>) {
    const res = await api.put(`/flood-indicators/${id}`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data as { success: boolean; data: FloodIndicator };
  },

  async deleteIndicator(id: string) {
    const res = await api.delete(`/flood-indicators/${id}`);
    return res.data as { success: boolean; message: string };
  },

  async updateWeights(items: Array<{ code: string; weight: number }>) {
    const res = await api.patch<{ success: boolean; data: FloodIndicator[]; message?: string }>(
      '/flood-indicators/weights',
      { items }
    );
    return res.data;
  },
};
