export interface WardData {
  ward_name: string;
  geometry: {
    type: string;
    rings: number[][][];
  };
  population_density: number;
  rainfall: number;
  low_elevation: number;
  urban_land: number;
  drainage_capacity: number;
}

export interface WardStat {
  ward_name: string;
  flood_risk: number;
  risk_level: string;
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
