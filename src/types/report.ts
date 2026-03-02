/** Ward item in report dashboard */
export interface WardReportItem {
  _id: string;
  ward_name: string;
  total_score: number;
  risk_level: string;
}

/** Risk level distribution */
export interface RiskDistribution {
  Cao: number;
  "Trung bình": number;
  Thấp: number;
}

/** Dashboard API response */
export interface ReportDashboardData {
  year: number;
  total: number;
  distribution: RiskDistribution;
  wards: WardReportItem[];
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  isWardAdmin?: boolean;
}

/** Year-over-year comparison item */
export interface YearComparison {
  level: string;
  year1: number;
  year2: number;
  change: number;
}

/** Ward compare for Ward Admin (single ward, 2 years) */
export interface WardCompareData {
  ward_name: string;
  year1: { total_score: number; risk_level: string } | null;
  year2: { total_score: number; risk_level: string } | null;
}

/** Compare API response */
export interface ReportCompareData {
  year1: number;
  year2: number;
  comparison?: YearComparison[];
  wardCompare?: WardCompareData;
  isWardAdmin?: boolean;
}
