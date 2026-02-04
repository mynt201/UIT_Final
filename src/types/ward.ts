export interface WardData {
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
  district?: string;
  province?: string;
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
