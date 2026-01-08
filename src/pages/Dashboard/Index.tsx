import { useMemo, useState, useEffect } from "react";

import { FaDownload } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";
import { Button } from "../../components";
import { useWards, useWardStats } from "../../hooks";
import {
  calcFloodRiskIndex,
  getRiskLevel,
} from "../PageView/Partials/floodRiskUtils";
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

  // Fetch data from API - hooks must be called unconditionally at the top level
  const { data: wardsData, isLoading: wardsLoading } = useWards({
    page: currentPage,
    limit: itemsPerPage,
    district: searchTerm ? undefined : undefined, // Add district filter if needed
  });

  const { isLoading: statsLoading } = useWardStats();

  // Loading state
  const isLoading = wardsLoading || statsLoading;

  // Convert API data to component format with calculated flood risk
  const wardStats = useMemo(() => {
    if (!wardsData?.wards) {
      return [];
    }

    return wardsData.wards.map((ward) => {
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

      return {
        ward_name: ward.ward_name,
        flood_risk: floodRisk,
        risk_level:
          riskLevel === "cao"
            ? "Cao"
            : riskLevel === "trungBinh"
            ? "Trung Bình"
            : "Thấp",
        population_density: ward.population_density,
        rainfall: ward.rainfall,
        exposure,
        susceptibility,
        resilience,
      };
    });
  }, [wardsData]);

  // Calculate statistics from computed data
  const statistics = useMemo(() => {
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
      totalWards: wardStats.length,
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
  }, [wardStats, wardsData]);

  const filteredWardStats = useMemo(() => {
    return wardStats.filter((ward) => {
      const matchesSearch = ward.ward_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRisk =
        selectedRiskLevel === "all" || ward.risk_level === selectedRiskLevel;
      return matchesSearch && matchesRisk;
    });
  }, [wardStats, searchTerm, selectedRiskLevel]);

  // Pagination logic
  const totalPages = Math.ceil(filteredWardStats.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm, selectedRiskLevel]);

  const paginatedWards = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return [...filteredWardStats]
      .sort((a, b) => b.flood_risk - a.flood_risk)
      .slice(startIndex, endIndex);
  }, [filteredWardStats, currentPage, itemsPerPage]);

  // Theme hook must be called unconditionally at the top level
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const riskDistribution = useMemo(
    () => [
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
    ],
    [statistics],
  );

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
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
        onSearchChange={setSearchTerm}
        onRiskLevelChange={setSelectedRiskLevel}
        filteredCount={filteredWardStats.length}
        totalCount={wardStats.length}
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
