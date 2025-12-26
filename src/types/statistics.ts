export type ViewType = "daily" | "monthly" | "yearly" | "comparison";

export interface DailyStatisticsProps {
  selectedYear: number;
  selectedMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

export interface MonthlyStatisticsProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export interface ComparisonStatisticsProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}
