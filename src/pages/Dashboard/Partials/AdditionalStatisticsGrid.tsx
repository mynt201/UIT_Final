import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";
import { formatNumber } from "../../../utils/formatUtils";
import type { AdditionalStatistics } from "../../../types";

interface AdditionalStatisticsGridProps {
  statistics: AdditionalStatistics;
}

export default function AdditionalStatisticsGrid({
  statistics,
}: AdditionalStatisticsGridProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
      >
        <div className={`${themeClasses.textSecondary} text-sm mb-2`}>
          Rủi ro trung bình
        </div>
        <div className="text-2xl font-bold text-orange-400 mb-1">
          {statistics.mediumRisk}
        </div>
        <div className={`text-xs ${themeClasses.textTertiary}`}>
          {((statistics.mediumRisk / statistics.totalWards) * 100).toFixed(1)}%
          tổng số
        </div>
      </div>
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
      >
        <div className={`${themeClasses.textSecondary} text-sm mb-2`}>
          Rủi ro thấp
        </div>
        <div className="text-2xl font-bold text-green-400 mb-1">
          {statistics.lowRisk}
        </div>
        <div className={`text-xs ${themeClasses.textTertiary}`}>
          {((statistics.lowRisk / statistics.totalWards) * 100).toFixed(1)}%
          tổng số
        </div>
      </div>
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
      >
        <div className={`${themeClasses.textSecondary} text-sm mb-2`}>
          Tổng mật độ dân số
        </div>
        <div className="text-2xl font-bold text-indigo-400 mb-1">
          {formatNumber(Math.round(statistics.totalPopulation))}
        </div>
        <div className={`text-xs ${themeClasses.textTertiary}`}>
          người/km²
        </div>
      </div>
    </div>
  );
}

