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

// Re-export WardStat from ward types to avoid duplication
export type { WardStat } from "./ward";

// Recharts Tooltip types
export interface TooltipPayload {
  name: string;
  value: number;
  payload: {
    name: string;
    value: number;
    percentage?: number;
    [key: string]: unknown;
  };
  color?: string;
  fill?: string;
  [key: string]: unknown;
}

export interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

// Chart data types (compatible with Recharts)
export interface PieChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
  [key: string]: string | number;
}

export interface BarChartData {
  name: string;
  value: number;
  percentage: number;
  fill: string;
  [key: string]: string | number;
}
