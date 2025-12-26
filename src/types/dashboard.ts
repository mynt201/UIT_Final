export interface Statistics {
  totalWards: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  avgRisk: number;
  maxRisk: number;
  totalPopulation: number;
  avgRainfall: number;
  avgElevation: number;
  avgDrainage: number;
}

export interface KeyMetricsData {
  maxRisk: number;
  avgRainfall: number;
  avgElevation: number;
  avgDrainage: number;
}

export interface AdditionalStatistics {
  mediumRisk: number;
  lowRisk: number;
  totalPopulation: number;
  totalWards: number;
}

export interface RiskDistributionItem {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

