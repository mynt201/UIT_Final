export interface WardData {
  id: string;
  ward_name: string;
  district: string;
  coordinates: string;
}

export interface WeatherData {
  id: string;
  ward_id: string;
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
}

export interface DrainageData {
  id: string;
  ward_id: string;
  name: string;
  type: string;
  condition: string;
}

export interface RoadBridgeData {
  id: string;
  ward_id: string;
  name: string;
  type: string;
  flood_level: number;
}

export interface RiskIndexData {
  id: string;
  ward_id: string;
  date: string;
  risk_index: number;
  exposure: number;
  susceptibility: number;
  resilience: number;
}

export type TabType = "ward" | "weather" | "drainage" | "road-bridge" | "risk-index";

