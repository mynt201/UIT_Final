import { useMemo, useState } from "react";

import { FaDownload, FaSpinner } from "react-icons/fa";
import { useDebounce } from "../../hooks/useDebounce";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";
import { Button } from "../../components";
import { useWards, useWardStats } from "../../hooks";
import {
  calcFloodRiskIndex,
  getRiskLevel,
} from "../PageView/Partials/floodRiskUtils";
import type { WardStat } from "../../types";
import SearchAndFilter from "./Partials/SearchAndFilter";
import StatisticsCards from "./Partials/StatisticsCards";
import RiskDistributionChart from "./Partials/RiskDistributionChart";
import KeyMetrics from "./Partials/KeyMetrics";
import WardsTable from "./Partials/WardsTable";
import AdditionalStatisticsGrid from "./Partials/AdditionalStatisticsGrid";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Handlers that reset page when filter/search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleRiskLevelChange = (value: string) => {
    setSelectedRiskLevel(value);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Fetch data from API with search and filter params
  const { data: wardsData, isLoading: wardsLoading } = useWards({
    page: currentPage,
    limit: itemsPerPage,
    ward_name: debouncedSearchTerm || undefined,
    risk_level: selectedRiskLevel !== "all" ? selectedRiskLevel : undefined,
  });

  const { data: statsData, isLoading: statsLoading, error: statsError } = useWardStats();

  // Loading state
  const isLoading = wardsLoading || statsLoading;

  // Convert API data to component format with calculated flood risk
  const wardStats = useMemo((): WardStat[] => {
    if (!wardsData?.wards) {
      return [];
    }

    return wardsData.wards.map((ward): WardStat => {
      // Calculate flood risk components
      const exposure = ward.population_density / 1000 + ward.rainfall / 200;
      const susceptibility = ward.low_elevation + ward.urban_land;
      const resilience = ward.drainage_capacity || 1;
      const floodRisk = calcFloodRiskIndex(
        exposure,
        susceptibility,
        resilience,
      );
      const riskLevel = getRiskLevel(floodRisk);

      const riskLevelLabel: "Cao" | "Trung Bình" | "Thấp" =
        riskLevel === "cao"
          ? "Cao"
          : riskLevel === "trungBinh"
          ? "Trung Bình"
          : "Thấp";

      return {
        ward_name: ward.ward_name,
        flood_risk: floodRisk,
        risk_level: riskLevelLabel,
        population_density: ward.population_density,
        rainfall: ward.rainfall,
        exposure,
        susceptibility,
        resilience,
      };
    });
  }, [wardsData]);

  // Calculate statistics - use API stats if available, otherwise calculate from local data
  const statistics = useMemo(() => {
    // If API stats are available, use them
    if (statsData && statsData.statistics && !statsError) {
      const apiStats = statsData.statistics;
      // Calculate risk level counts from wardStats (for current page)
      const highRisk = wardStats.filter((w) => w.risk_level === "Cao").length;
      const mediumRisk = wardStats.filter(
        (w) => w.risk_level === "Trung Bình",
      ).length;
      const lowRisk = wardStats.filter((w) => w.risk_level === "Thấp").length;

      return {
        totalWards: apiStats.totalWards || 0,
        highRisk,
        mediumRisk,
        lowRisk,
        avgRisk: apiStats.avgRisk || 0,
        maxRisk: apiStats.maxRisk || 0,
        totalPopulation: apiStats.totalPopulation || 0,
        avgRainfall: apiStats.avgRainfall || 0,
        avgElevation: apiStats.avgElevation || 0,
        avgDrainage: apiStats.avgDrainage || 0,
      };
    }

    // Fallback: Calculate from local data
    const highRisk = wardStats.filter((w) => w.risk_level === "Cao").length;
    const mediumRisk = wardStats.filter(
      (w) => w.risk_level === "Trung Bình",
    ).length;
    const lowRisk = wardStats.filter((w) => w.risk_level === "Thấp").length;
    const avgRisk =
      wardStats.length > 0
        ? wardStats.reduce((sum, w) => sum + w.flood_risk, 0) / wardStats.length
        : 0;
    const maxRisk =
      wardStats.length > 0
        ? Math.max(...wardStats.map((w) => w.flood_risk))
        : 0;
    const totalPopulation = wardStats.reduce(
      (sum, w) => sum + w.population_density,
      0,
    );
    const avgRainfall =
      wardStats.length > 0
        ? wardStats.reduce((sum, w) => sum + w.rainfall, 0) / wardStats.length
        : 0;

    // Calculate from filtered wards for elevation and drainage
    const filteredWards = wardsData?.wards || [];
    const avgElevation =
      filteredWards.length > 0
        ? filteredWards.reduce((sum, w) => sum + w.low_elevation, 0) /
          filteredWards.length
        : 0;
    const avgDrainage =
      filteredWards.length > 0
        ? filteredWards.reduce((sum, w) => sum + w.drainage_capacity, 0) /
          filteredWards.length
        : 0;

    return {
      totalWards: wardStats?.length || 0,
      highRisk,
      mediumRisk,
      lowRisk,
      avgRisk,
      maxRisk,
      totalPopulation,
      avgRainfall,
      avgElevation,
      avgDrainage,
    };
  }, [wardStats, wardsData, statsData, statsError]);

  // Use API data directly - no local filtering needed as API handles it
  const filteredWardStats = wardStats;

  // Pagination logic - use API pagination
  const totalPages = wardsData?.pagination?.pages || 1;
  const totalCount = wardsData?.pagination?.total || 0;

  // Use API data directly - already paginated and filtered
  const paginatedWards = filteredWardStats;

  // Theme hook must be called unconditionally at the top level
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const riskDistribution = useMemo(() => {
    // Use API risk distribution if available
    if (statsData && statsData.riskDistribution && !statsError) {
      return statsData.riskDistribution.map((item) => {
        // Map API labels to display labels
        let label = item.label;
        let color = "bg-gray-400";
        
        if (item.label === "High" || item.label === "Very High") {
          label = "Cao";
          color = "bg-red-500";
        } else if (item.label === "Medium") {
          label = "Trung Bình";
          color = "bg-orange-400";
        } else if (item.label === "Low" || item.label === "Very Low") {
          label = "Thấp";
          color = "bg-green-400";
        }

        return {
          label,
          count: item.count,
          color,
          percentage: parseFloat(item.percentage.toString()) || 0,
        };
      });
    }

    // Fallback: Calculate from local statistics
    return [
      {
        label: "Cao",
        count: statistics.highRisk,
        color: "bg-red-500",
        percentage:
          statistics.totalWards > 0
            ? (statistics.highRisk / statistics.totalWards) * 100
            : 0,
      },
      {
        label: "Trung Bình",
        count: statistics.mediumRisk,
        color: "bg-orange-400",
        percentage:
          statistics.totalWards > 0
            ? (statistics.mediumRisk / statistics.totalWards) * 100
            : 0,
      },
      {
        label: "Thấp",
        count: statistics.lowRisk,
        color: "bg-green-400",
        percentage:
          statistics.totalWards > 0
            ? (statistics.lowRisk / statistics.totalWards) * 100
            : 0,
      },
    ];
  }, [statistics, statsData, statsError]);

  const handleExportCSV = () => {
    const headers = [
      "Tên phường/xã",
      "Chỉ số rủi ro",
      "Mức độ",
      "Mật độ dân số",
      "Lượng mưa",
      "Exposure",
      "Susceptibility",
      "Resilience",
    ];

    const rows = wardStats.map((ward) => [
      ward.ward_name,
      ward.flood_risk.toFixed(2),
      ward.risk_level,
      ward.population_density.toString(),
      ward.rainfall.toString(),
      ward.exposure.toFixed(2),
      ward.susceptibility.toFixed(2),
      ward.resilience.toFixed(2),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `dashboard_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show loading spinner or placeholder
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen gap-3 ${themeClasses.text}`}>
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <p className="text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div
      className={`p-4 md:p-6 space-y-4 md:space-y-6 ${themeClasses.background}`}
    >
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${themeClasses.text}`}>
            Dashboard Quản Trị
          </h1>
          <p className={themeClasses.textSecondary}>
            Tổng quan hệ thống quản lý rủi ro ngập lụt TP.HCM
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleExportCSV}
          className="flex items-center gap-2"
        >
          <FaDownload />
          <span>Xuất dữ liệu CSV</span>
        </Button>
      </div>

      {/* Search and Filter */}
      <SearchAndFilter
        searchTerm={searchTerm}
        selectedRiskLevel={selectedRiskLevel}
        onSearchChange={handleSearchChange}
        onRiskLevelChange={handleRiskLevelChange}
        filteredCount={totalCount}
        totalCount={totalCount}
      />

      {/* Statistics Cards */}
      <StatisticsCards statistics={statistics} />

      {/* Charts and Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart with Pie Chart */}
        <div
          className={`lg:col-span-2 ${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-6`}
        >
          <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>
            Phân bố mức độ rủi ro
          </h2>
          <RiskDistributionChart
            riskDistribution={riskDistribution}
            totalWards={statistics.totalWards}
          />
        </div>

        {/* Key Metrics */}
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-6`}
        >
          <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>
            Chỉ số quan trọng
          </h2>
          <KeyMetrics
            metrics={{
              maxRisk: statistics.maxRisk,
              avgRainfall: statistics.avgRainfall,
              avgElevation: statistics.avgElevation,
              avgDrainage: statistics.avgDrainage,
            }}
          />
        </div>
      </div>

      {/* All Wards Table with Pagination */}
      <WardsTable
        wards={paginatedWards}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Additional Statistics Grid */}
      <AdditionalStatisticsGrid
        statistics={{
          mediumRisk: statistics.mediumRisk,
          lowRisk: statistics.lowRisk,
          totalPopulation: statistics.totalPopulation,
          totalWards: statistics.totalWards,
        }}
      />
    </div>
  );
};

export default Index;
