import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { ChangeEvent } from "react";
import FloodMapView from "./Partials/FloodMapView";
import FilterSection from "./Partials/FilterSection";
import WeatherForecast from "./Partials/WeatherForecast";
import { mockWards } from "../../mockData";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";

const PageView = () => {
  const [searchParams] = useSearchParams();

  const getInitialWard = () => {
    const searchTerm = searchParams.get("search");
    if (searchTerm) {
      const matchingWard = mockWards.find((ward) =>
        ward.ward_name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      return matchingWard?.ward_name || "";
    }
    return "";
  };

  const [selectedWard, setSelectedWard] = useState<string>(getInitialWard);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<string[]>([
    "cao",
    "trungBinh",
    "thap",
  ]);
  const [riskIndexRange, setRiskIndexRange] = useState<[number, number]>([
    0, 10,
  ]);
  const [filteredCount, setFilteredCount] = useState<number>(0);

  const wardOptions = mockWards.map((ward) => ({
    label: ward.ward_name,
    value: ward.ward_name,
  }));

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
    if (searchTerm) {
      const matchingWard = mockWards.find((ward) =>
        ward.ward_name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      if (matchingWard && matchingWard.ward_name !== selectedWard) {
        setSelectedWard(matchingWard.ward_name);
      }
    } else if (selectedWard) {
      setSelectedWard("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

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
