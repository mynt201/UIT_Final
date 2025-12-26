import { useMemo } from "react";
import {
  FaCalendarAlt,
  FaCloudRain,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

import type { MonthlyStatisticsProps } from "../../../types";
import { Select } from "../../../components";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";

const MonthlyStatistics = ({
  selectedYear,
  onYearChange,
}: MonthlyStatisticsProps) => {
  const monthlyData = useMemo(() => {
    const months = [];
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];

    // Simple seeded random function for consistent mock data
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let month = 1; month <= 12; month++) {
      const seed = selectedYear * 100 + month;
      // Mock data with seeded random for consistency
      const avgRainfall = 80 + seededRandom(seed) * 120;
      const avgRisk = 2.0 + seededRandom(seed + 1) * 2.5;
      const highRiskDays = Math.floor(seededRandom(seed + 2) * 10) + 5;
      const totalDays = new Date(selectedYear, month, 0).getDate();

      months.push({
        month,
        monthName: monthNames[month - 1],
        avgRainfall: Math.round(avgRainfall),
        avgRisk: parseFloat(avgRisk.toFixed(2)),
        highRiskDays,
        totalDays,
        maxRainfall: Math.round(avgRainfall * 1.5),
        minRainfall: Math.round(avgRainfall * 0.5),
      });
    }

    return months;
  }, [selectedYear]);

  const totalRainfall = monthlyData.reduce((sum, m) => sum + m.avgRainfall, 0);
  const avgRiskYear = (
    monthlyData.reduce((sum, m) => sum + m.avgRisk, 0) / 12
  ).toFixed(2);
  const totalHighRiskDays = monthlyData.reduce(
    (sum, m) => sum + m.highRiskDays,
    0,
  );

  const maxRainfall = Math.max(...monthlyData.map((m) => m.avgRainfall));
  const maxRisk = Math.max(...monthlyData.map((m) => m.avgRisk));

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );

  // Calculate trends
  const firstHalfAvg =
    monthlyData.slice(0, 6).reduce((sum, m) => sum + m.avgRisk, 0) / 6;
  const secondHalfAvg =
    monthlyData.slice(6, 12).reduce((sum, m) => sum + m.avgRisk, 0) / 6;
  const trend = secondHalfAvg > firstHalfAvg ? "up" : "down";

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4`}
      >
        <div className="max-w-xs">
          <Select
            label="Năm"
            options={years.map((year) => ({
              value: year,
              label: year.toString(),
            }))}
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <FaCloudRain className="text-indigo-400 text-xl" />
            <div className="text-gray-400 text-sm">Tổng lượng mưa</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {totalRainfall.toLocaleString()} mm
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <FaCalendarAlt className="text-orange-400 text-xl" />
            <div className="text-gray-400 text-sm">Chỉ số rủi ro TB</div>
          </div>
          <div className="text-2xl font-bold text-white">{avgRiskYear}</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <FaExclamationTriangle className="text-red-400 text-xl" />
            <div className="text-gray-400 text-sm">Ngày rủi ro cao</div>
          </div>
          <div className="text-2xl font-bold text-red-400">
            {totalHighRiskDays} ngày
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            {trend === "up" ? (
              <FaArrowUp className="text-red-400 text-xl" />
            ) : (
              <FaArrowDown className="text-green-400 text-xl" />
            )}
            <div className="text-gray-400 text-sm">Xu hướng</div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xl font-bold ${
                trend === "up" ? "text-red-400" : "text-green-400"
              }`}
            >
              {trend === "up" ? "Tăng" : "Giảm"}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rainfall Chart */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Lượng mưa trung bình theo tháng
          </h3>
          <div className="space-y-3">
            {monthlyData.map((data) => (
              <div key={data.month} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{data.monthName}</span>
                  <span className="text-white font-medium">
                    {data.avgRainfall} mm
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all"
                    style={{
                      width: `${(data.avgRainfall / maxRainfall) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Index Chart */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Chỉ số rủi ro trung bình theo tháng
          </h3>
          <div className="space-y-3">
            {monthlyData.map((data) => {
              const riskColor =
                data.avgRisk >= 3.5
                  ? "bg-red-500"
                  : data.avgRisk >= 2.0
                  ? "bg-orange-400"
                  : "bg-green-400";
              return (
                <div key={data.month} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{data.monthName}</span>
                    <span className="text-white font-medium">
                      {data.avgRisk.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${riskColor} h-full rounded-full transition-all`}
                      style={{
                        width: `${(data.avgRisk / maxRisk) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            Chi tiết theo tháng - Năm {selectedYear}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50 border-b border-gray-700">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Tháng
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Lượng mưa TB (mm)
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Lượng mưa Max (mm)
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Lượng mưa Min (mm)
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Chỉ số rủi ro TB
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Ngày rủi ro cao
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data) => (
                <tr
                  key={data.month}
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                >
                  <td className="p-4 font-medium text-white">
                    {data.monthName}
                  </td>
                  <td className="p-4 text-gray-300">{data.avgRainfall}</td>
                  <td className="p-4 text-gray-300">{data.maxRainfall}</td>
                  <td className="p-4 text-gray-300">{data.minRainfall}</td>
                  <td className="p-4">
                    <span className="font-bold text-white">
                      {data.avgRisk.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-red-400 font-medium">
                      {data.highRiskDays}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyStatistics;
