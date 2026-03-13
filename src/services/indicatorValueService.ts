import { api } from '../plugins/axios';

export interface FloodIndicator {
  _id: string;
  code: string;
  name: string;
  group_type: string;
  weight: number;
  unit?: string;
  /**
   * 1 = Thuận (Mưa, Triều cường, Mật độ dân số): giá trị càng lớn, rủi ro càng cao.
   *    Chuẩn hóa: I = (X - Xmin) / (Xmax - Xmin).
   * 0 = Nghịch (Địa hình, Mật độ cống): giá trị càng nhỏ, rủi ro càng cao.
   *    Chuẩn hóa: I = (Xmax - X) / (Xmax - Xmin).
   * Xmin, Xmax lấy theo ngưỡng theo từng phường và chỉ số (indicator_thresholds).
   */
  direction?: 0 | 1;
}

export interface IndicatorValueRecord {
  _id: string;
  unit_id: { _id: string; name: string } | string;
  indicator_id: { _id: string; code: string; name: string } | string;
  data_year: number;
  raw_value: number;
  /** Do BE tính khi tạo/cập nhật/upload và lưu DB; FE chỉ đọc. */
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

  /** Năm có dữ liệu chỉ số (dynamic theo data upload). unit_id tùy chọn. Mặc định 2020–2025 nếu chưa có data. */
  async getAvailableYears(unitId?: string | null) {
    const params: Record<string, string> = {};
    if (unitId && unitId !== '') params.unit_id = unitId;
    const res = await api.get<{ success: boolean; years: number[] }>('/indicator-values/years', {
      params,
    });
    const raw = (res.data as { years?: number[] })?.years;
    return Array.isArray(raw) && raw.length > 0 ? raw : [2025, 2024, 2023, 2022, 2021, 2020];
  },

  /**
   * Tạo bản ghi chỉ số. Chỉ gửi raw_value; BE bắt buộc tính normalized_value từ ngưỡng + direction và lưu DB.
   */
  async createValue(payload: {
    unit_id: string;
    indicator_id: string;
    data_year: number;
    raw_value: number;
  }) {
    const res = await api.post('/indicator-values', payload);
    return res.data as { success: boolean; data: IndicatorValueRecord };
  },

  /**
   * Cập nhật bản ghi. Khi gửi raw_value, BE bắt buộc tính lại normalized_value và cập nhật DB.
   */
  async updateValue(
    id: string,
    payload: { raw_value?: number }
  ) {
    const res = await api.put(`/indicator-values/${id}`, payload);
    return res.data as { success: boolean; data: IndicatorValueRecord };
  },

  async deleteValue(id: string) {
    const res = await api.delete(`/indicator-values/${id}`);
    return res.data as { success: boolean; message: string };
  },

  /**
   * Bulk upsert chỉ số. Chỉ gửi raw_value; BE bắt buộc tính normalized_value cho từng bản ghi và lưu DB.
   */
  async bulkUpsert(
    items: Array<{
      unit_id: string;
      indicator_id: string;
      data_year: number;
      raw_value: number;
    }>
  ) {
    const res = await api.post('/indicator-values/bulk-upsert', { items });
    return res.data as { success: boolean; data: IndicatorValueRecord[]; count: number };
  },

  /** Tải template CSV - tiêu đề cột dynamic theo quản lý chỉ số (BE). */
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
    link.setAttribute('download', 'Chi_so_rui_ro_ngap_lut_Template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Upload CSV chỉ số. BE parse CSV, map cột → raw_value, tính normalized_value cho từng dòng và lưu DB.
   */
  async uploadCsv(file: File, unitId: string) {
    const form = new FormData();
    form.append('file', file);
    form.append('unit_id', unitId);
    const res = await api.post<{
      success: boolean;
      data?: IndicatorValueRecord[];
      count?: number;
      message?: string;
      error?: string;
    }>('/indicator-values/upload-csv', form);
    return res.data;
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
