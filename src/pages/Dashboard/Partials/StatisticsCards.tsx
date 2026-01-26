import {
  FaExclamationTriangle,
  FaChartLine,
  FaUsers,
} from "react-icons/fa";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";
import type { Statistics } from "../../../types";

interface StatisticsCardsProps {
  statistics: Statistics;
}

export default function StatisticsCards({
  statistics,
}: StatisticsCardsProps) {
  // Provide default values if statistics is undefined
  const safeStats = statistics || {
    totalWards: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    avgRisk: 0,
    maxRisk: 0,
    totalPopulation: 0,
    avgRainfall: 0,
    avgElevation: 0,
    avgDrainage: 0,
  };
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5 hover:border-indigo-500 transition-colors`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-red-500/20 rounded-lg">
            <FaExclamationTriangle className="text-red-400 text-xl" />
          </div>
          <span className={`text-xs ${themeClasses.textSecondary}`}>
            Tổng số phường/xã
          </span>
        </div>
        <div className={`text-3xl font-bold mb-1 ${themeClasses.text}`}>
          {safeStats.totalWards}
        </div>
        <div className={`text-sm ${themeClasses.textSecondary}`}>
          Khu vực được giám sát
        </div>
      </div>

      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5 hover:border-red-500 transition-colors`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-red-500/20 rounded-lg">
            <FaExclamationTriangle className="text-red-400 text-xl" />
          </div>
          <span className={`text-xs ${themeClasses.textSecondary}`}>
            Rủi ro cao
          </span>
        </div>
        <div className="text-3xl font-bold text-red-400 mb-1">
          {safeStats.highRisk}
        </div>
        <div className={`text-sm ${themeClasses.textSecondary}`}>
          {((safeStats.highRisk / safeStats.totalWards) * 100 || 0).toFixed(1)}%
          tổng số
        </div>
      </div>

      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5 hover:border-orange-500 transition-colors`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-orange-400/20 rounded-lg">
            <FaChartLine className="text-orange-400 text-xl" />
          </div>
          <span className={`text-xs ${themeClasses.textSecondary}`}>
            Chỉ số TB
          </span>
        </div>
        <div className="text-3xl font-bold text-orange-400 mb-1">
          {safeStats.avgRisk.toFixed(2)}
        </div>
        <div className={`text-sm ${themeClasses.textSecondary}`}>
          Rủi ro trung bình
        </div>
      </div>

      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5 hover:border-indigo-500 transition-colors`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-indigo-500/20 rounded-lg">
            <FaUsers className="text-indigo-400 text-xl" />
          </div>
          <span className={`text-xs ${themeClasses.textSecondary}`}>
            Mật độ dân số TB
          </span>
        </div>
        <div className="text-3xl font-bold text-indigo-400 mb-1">
          {Math.round(
            statistics.totalPopulation / statistics.totalWards,
          ).toLocaleString('vi-VN')}
        </div>
        <div className={`text-sm ${themeClasses.textSecondary}`}>
          người/km²
        </div>
      </div>
    </div>
  );
}

