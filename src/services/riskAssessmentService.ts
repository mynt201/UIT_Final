import { api } from "../plugins/axios";

export interface RiskAssessmentItem {
  _id: string;
  unit_id: { _id: string; name: string };
  year: number;
  total_score: number;
  risk_level: string;
}

export const riskAssessmentService = {
  async refreshAssessments(year?: number) {
    const yr = year ?? new Date().getFullYear();
    const res = await api.post<{
      success: boolean;
      data: RiskAssessmentItem[];
      count: number;
      year: number;
      message: string;
    }>(`/risk-assessments/refresh?year=${yr}`);
    return res.data;
  },

  async getFloodRiskGeoJSON(year?: number) {
    const yr = year ?? new Date().getFullYear();
    const res = await api.get<{
      type: "FeatureCollection";
      features: Array<{
        type: "Feature";
        geometry: { type: string; coordinates: unknown };
        properties: { id: string; name: string; risk_level: string; total_score: number };
      }>;
    }>(`/map/flood-risk?year=${yr}`);
    return res.data;
  },
};
