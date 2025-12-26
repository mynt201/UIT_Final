import { useMemo, useState } from "react";
import { mockWards } from "../../mockData";
import {
  calcFloodRiskIndex,
  getRiskLevel,
  getRiskLevelLabel,
} from "../PageView/Partials/floodRiskUtils";
import { FaDownload } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";
import { Button } from "../../components";
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

  const wardStats = useMemo<WardStat[]>(() => {
    return mockWards.map((ward) => {
      const exposure = ward.population_density / 1000 + ward.rainfall / 200;
      const susceptibility = ward.low_elevation + ward.urban_land;
      const resilience = ward.drainage_capacity || 1;
      const floodRisk = calcFloodRiskIndex(
        exposure,
        susceptibility,
        resilience,
      );
      const riskLevel = getRiskLevel(floodRisk);
      const levelLabel = getRiskLevelLabel(riskLevel);

      return {
        ward_name: ward.ward_name,
        flood_risk: floodRisk,
        risk_level: levelLabel,
        population_density: ward.population_density,
        rainfall: ward.rainfall,
        exposure,
        susceptibility,
        resilience,
      };
    });
  }, []);

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

  const statistics = useMemo(() => {
    const highRisk = filteredWardStats.filter(
      (w) => w.risk_level === "Cao",
    ).length;
    const mediumRisk = filteredWardStats.filter(
      (w) => w.risk_level === "Trung Bình",
    ).length;
    const lowRisk = filteredWardStats.filter(
      (w) => w.risk_level === "Thấp",
    ).length;
    const avgRisk =
      filteredWardStats.length > 0
        ? filteredWardStats.reduce((sum, w) => sum + w.flood_risk, 0) /
          filteredWardStats.length
        : 0;
    const maxRisk =
      filteredWardStats.length > 0
        ? Math.max(...filteredWardStats.map((w) => w.flood_risk))
        : 0;
    const totalPopulation = filteredWardStats.reduce(
      (sum, w) => sum + w.population_density,
      0,
    );
    const avgRainfall =
      filteredWardStats.length > 0
        ? filteredWardStats.reduce((sum, w) => sum + w.rainfall, 0) /
          filteredWardStats.length
        : 0;
    const filteredMockWards = mockWards.filter((ward) => {
      const wardStat = wardStats.find((ws) => ws.ward_name === ward.ward_name);
      if (!wardStat) return false;
      const matchesSearch = wardStat.ward_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRisk =
        selectedRiskLevel === "all" ||
        wardStat.risk_level === selectedRiskLevel;
      return matchesSearch && matchesRisk;
    });
    const avgElevation =
      filteredMockWards.length > 0
        ? filteredMockWards.reduce((sum, w) => sum + w.low_elevation, 0) /
          filteredMockWards.length
        : 0;
    const avgDrainage =
      filteredMockWards.length > 0
        ? filteredMockWards.reduce((sum, w) => sum + w.drainage_capacity, 0) /
          filteredMockWards.length
        : 0;

    return {
      totalWards: filteredWardStats.length,
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
  }, [filteredWardStats, wardStats, searchTerm, selectedRiskLevel]);

  // Pagination logic
  const totalPages = Math.ceil(filteredWardStats.length / itemsPerPage);
  const validCurrentPage = useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      return 1;
    }
    return currentPage;
  }, [currentPage, totalPages]);

  // Sync state when page becomes invalid
  if (validCurrentPage !== currentPage && totalPages > 0) {
    // Use setTimeout to avoid synchronous state update
    setTimeout(() => setCurrentPage(validCurrentPage), 0);
  }

  const paginatedWards = useMemo(() => {
    const page = validCurrentPage;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return [...filteredWardStats]
      .sort((a, b) => b.flood_risk - a.flood_risk)
      .slice(startIndex, endIndex);
  }, [filteredWardStats, validCurrentPage, itemsPerPage]);

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

  const riskDistribution = [
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

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

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
        currentPage={validCurrentPage}
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
