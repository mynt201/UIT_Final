import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { ChangeEvent } from "react";
import FloodMapView from "./Partials/FloodMapView";
import FilterSection from "./Partials/FilterSection";
import WeatherForecast from "./Partials/WeatherForecast";
import { useWards } from "../../hooks/useWards";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";

const PageView = () => {
  const [searchParams] = useSearchParams();
  const {
    data: wardsData,
    isLoading: wardsLoading,
    error: wardsError,
  } = useWards({ limit: 100 });

  const [selectedWard, setSelectedWard] = useState<string>("");
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<string[]>([
    "cao",
    "trungBinh",
    "thap",
  ]);
  const [riskIndexRange, setRiskIndexRange] = useState<[number, number]>([
    0, 10,
  ]);
  const [filteredCount, setFilteredCount] = useState<number>(0);

  // Update selectedWard when wards data is loaded
  useEffect(() => {
    if (wardsData?.wards) {
      const searchTerm = searchParams.get("search");
      if (searchTerm) {
        const matchingWard = wardsData.wards.find((ward) =>
          ward.ward_name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        const initialWard = matchingWard?.ward_name || "";
        setSelectedWard(initialWard);
      }
    }
  }, [wardsData, searchParams]);

  const wardOptions =
    wardsData?.wards?.map((ward) => ({
      label: ward.ward_name,
      value: ward.ward_name,
    })) || [];

  const handleWardChange = (
    event:
      | ChangeEvent<HTMLInputElement>
      | (Event & { target: { value: unknown; name: string } }),
  ) => {
    const value = "target" in event ? String(event.target.value) : "";
    setSelectedWard(value);
  };

  const handleRiskLevelChange = (value: string) => {
    setSelectedRiskLevels((prev) => {
      if (prev.includes(value)) {
        return prev.filter((level) => level !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleRiskIndexRangeChange = (min: number, max: number) => {
    setRiskIndexRange([min, max]);
  };

  const handleResetFilters = () => {
    setSelectedWard("");
    setSelectedRiskLevels(["cao", "trungBinh", "thap"]);
    setRiskIndexRange([0, 10]);
  };

  useEffect(() => {
    const searchTerm = searchParams.get("search");
    if (searchTerm && wardsData?.wards) {
      const matchingWard = wardsData.wards.find((ward) =>
        ward.ward_name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      if (matchingWard && matchingWard.ward_name !== selectedWard) {
        setSelectedWard(matchingWard.ward_name);
      }
    } else if (selectedWard && !searchTerm) {
      setSelectedWard("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, wardsData]);

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

      {/* Weather Forecast */}
      <div className="shrink-0 px-2 md:px-3 pb-2 md:pb-3">
        <WeatherForecast />
      </div>

      {/* Filter Section */}
      <div className="shrink-0">
        <FilterSection
          selectedWard={selectedWard}
          selectedRiskLevels={selectedRiskLevels}
          riskIndexRange={riskIndexRange}
          filteredCount={filteredCount}
          wardOptions={wardOptions}
          onWardChange={handleWardChange}
          onRiskLevelChange={handleRiskLevelChange}
          onRiskIndexRangeChange={handleRiskIndexRangeChange}
          onResetFilters={handleResetFilters}
        />
      </div>

      {/* Map View */}
      <div className="flex-1 min-h-[500px] shrink-0">
        <FloodMapView
          selectedWard={selectedWard}
          selectedRiskLevels={selectedRiskLevels}
          riskIndexRange={riskIndexRange}
          onFilteredCountChange={setFilteredCount}
        />
      </div>
    </div>
  );
};

export default PageView;
