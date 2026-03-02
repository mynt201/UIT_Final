export interface WardData {
  _id?: string;
  ward_name: string;
  geometry: {
    type: string;
    rings?: number[][][]; // Format cũ (mock data)
    coordinates?: number[][][][] | number[][][]; // GeoJSON format (MultiPolygon hoặc Polygon)
  };
  population_density: number;
  rainfall: number;
  low_elevation: number;
  urban_land: number;
  drainage_capacity: number;
  flood_risk?: number;
  risk_level?: string;
  exposure?: number;
  susceptibility?: number;
  resilience?: number;
  district?: string;
  province?: string;
  area_km2?: number;
  population?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WardStat {
  ward_name: string;
  flood_risk: number;
  risk_level: "Cao" | "Trung Bình" | "Thấp";
  population_density: number;
  rainfall: number;
  exposure: number;
  susceptibility: number;
  resilience: number;
}

export interface WardDetail {
  ward_name: string;
  flood_risk: number;
  risk_level: string;
  population_density: number;
  rainfall: number;
  exposure: number;
  susceptibility: number;
  resilience: number;
  low_elevation: number;
  drainage_capacity: number;
  urban_land: number;
}

/** Chi tiết đơn vị hành chính từ DB: AdministrativeUnit + RiskAssessment + IndicatorValue */
export interface WardDetailFromDB {
  unit_id: string;
  name: string;
  area_km2: number;
  total_score: number | null;
  risk_level: string;
  indicator_values: Array<{
    indicator_code: string;
    indicator_name: string;
    unit?: string;
    group_type?: string;
    raw_value: number;
    normalized_value: number;
  }>;
}
