import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";
import type { KeyMetricsData } from "../../../types";

interface KeyMetricsProps {
  metrics: KeyMetricsData;
}

export default function KeyMetrics({ metrics }: KeyMetricsProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className="space-y-4">
      <div
        className={`p-3 rounded-lg ${
          theme === "light" ? "bg-gray-100" : "bg-gray-700/50"
        }`}
      >
        <div className={`text-xs mb-1 ${themeClasses.textSecondary}`}>
          Chỉ số rủi ro cao nhất
        </div>
        <div className="text-2xl font-bold text-red-400">
          {metrics.maxRisk.toFixed(2)}
        </div>
      </div>
      <div
        className={`p-3 rounded-lg ${
          theme === "light" ? "bg-gray-100" : "bg-gray-700/50"
        }`}
      >
        <div className={`text-xs mb-1 ${themeClasses.textSecondary}`}>
          Lượng mưa trung bình
        </div>
        <div className="text-2xl font-bold text-indigo-400">
          {metrics.avgRainfall.toFixed(0)} mm
        </div>
      </div>
      <div
        className={`p-3 rounded-lg ${
          theme === "light" ? "bg-gray-100" : "bg-gray-700/50"
        }`}
      >
        <div className={`text-xs mb-1 ${themeClasses.textSecondary}`}>
          Độ cao thấp trung bình
        </div>
        <div className="text-2xl font-bold text-yellow-400">
          {metrics.avgElevation.toFixed(1)} m
        </div>
      </div>
      <div
        className={`p-3 rounded-lg ${
          theme === "light" ? "bg-gray-100" : "bg-gray-700/50"
        }`}
      >
        <div className={`text-xs mb-1 ${themeClasses.textSecondary}`}>
          Khả năng thoát nước TB
        </div>
        <div className="text-2xl font-bold text-green-400">
          {metrics.avgDrainage.toFixed(1)}
        </div>
      </div>
    </div>
  );
}

