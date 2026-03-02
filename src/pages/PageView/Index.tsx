import { useState } from "react";
import FloodMapView from "./Partials/FloodMapView";
import FilterSection from "./Partials/FilterSection";
import { useWards } from "../../hooks/useWards";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";

const PageView = () => {
  const { isLoading: wardsLoading, error: wardsError } = useWards({ limit: 100 });

  const [selectedRiskLevels, setSelectedRiskLevels] = useState<string[]>([
    "cao",
    "trungBinh",
    "thap",
  ]);

  const handleRiskLevelChange = (value: string) => {
    setSelectedRiskLevels((prev) => {
      if (prev.includes(value)) {
        return prev.filter((level) => level !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  // Show loading state while fetching wards
  if (wardsLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className={`text-sm ${themeClasses.textSecondary}`}>
            Đang tải dữ liệu khu vực...
          </p>
        </div>
      </div>
    );
  }

  // Show error state if wards fetch failed
  if (wardsError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className={`text-sm ${themeClasses.textSecondary} mb-2`}>
            Không thể tải dữ liệu khu vực
          </p>
          <p className={`text-xs ${themeClasses.textSecondary}`}>
            Vui lòng thử lại sau
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto overflow-x-hidden">
      <div
        className={`${themeClasses.text} text-sm md:text-base p-2 md:p-3 shrink-0`}
      >
        Bản đồ khu vực TP.HCM. Dữ liệu bản đồ
      </div>

      {/* Filter Section */}
      <div className="shrink-0">
        <FilterSection
          selectedRiskLevels={selectedRiskLevels}
          onRiskLevelChange={handleRiskLevelChange}
        />
      </div>

      {/* Map View */}
      <div className="flex-1 min-h-[400px] flex flex-col">
        <FloodMapView selectedRiskLevels={selectedRiskLevels} />
      </div>
    </div>
  );
};

export default PageView;
