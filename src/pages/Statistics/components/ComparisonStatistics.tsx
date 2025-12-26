import { useMemo } from "react";
import {
  FaBalanceScale,
  FaChartLine,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

import type { ComparisonStatisticsProps } from "../../../types";
import { Input } from "../../../components";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";

const ComparisonStatistics = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: ComparisonStatisticsProps) => {
  const comparisonData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Generate mock data for period 1 (first half)
    const period1Start = start;
    const period1End = new Date(start.getTime() + diffTime / 2);
    const period2Start = new Date(period1End.getTime() + 1);
    const period2End = end;

    // Simple seeded random function for consistent mock data
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    // Use dates as seeds for consistent results
    const period1Seed = start.getTime();
    const period2Seed = period2Start.getTime();

    // Mock calculations with seeded random
    const period1Data = {
      avgRainfall: 120 + seededRandom(period1Seed) * 80,
      avgRisk: 2.5 + seededRandom(period1Seed + 1) * 1.5,
      highRiskDays: Math.floor((diffDays / 2) * 0.3),
      totalDays: Math.floor(diffDays / 2),
      maxRisk: 3.5 + seededRandom(period1Seed + 2) * 1.5,
      minRisk: 1.5 + seededRandom(period1Seed + 3) * 0.5,
    };

    const period2Data = {
      avgRainfall: 100 + seededRandom(period2Seed) * 100,
      avgRisk: 2.0 + seededRandom(period2Seed + 1) * 2.0,
      highRiskDays: Math.floor((diffDays / 2) * 0.25),
      totalDays: Math.ceil(diffDays / 2),
      maxRisk: 3.0 + seededRandom(period2Seed + 2) * 2.0,
      minRisk: 1.0 + seededRandom(period2Seed + 3) * 1.0,
    };

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      period1: {
        ...period1Data,
        label: `Giai đoạn 1 (${period1Start.toLocaleDateString(
          "vi-VN",
        )} - ${period1End.toLocaleDateString("vi-VN")})`,
      },
      period2: {
        ...period2Data,
        label: `Giai đoạn 2 (${period2Start.toLocaleDateString(
          "vi-VN",
        )} - ${period2End.toLocaleDateString("vi-VN")})`,
      },
      changes: {
        rainfall: calculateChange(
          period2Data.avgRainfall,
          period1Data.avgRainfall,
        ),
        risk: calculateChange(period2Data.avgRisk, period1Data.avgRisk),
        highRiskDays: calculateChange(
          period2Data.highRiskDays,
          period1Data.highRiskDays,
        ),
      },
    };
  }, [startDate, endDate]);

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className="space-y-6">
      {/* Date Range Filters */}
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4`}
      >
        <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>
          Chọn khoảng thời gian so sánh
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Ngày bắt đầu"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
          <Input
            label="Ngày kết thúc"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
        <div className={`mt-4 text-sm ${themeClasses.textSecondary}`}>
          Hệ thống sẽ tự động chia khoảng thời gian thành 2 giai đoạn để so sánh
        </div>
      </div>

      {/* Comparison Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <FaBalanceScale className="text-indigo-400 text-xl" />
            <div className="text-gray-400 text-sm">Thay đổi Lượng mưa</div>
          </div>
          <div
            className={`text-2xl font-bold flex items-center gap-2 ${
              comparisonData.changes.rainfall >= 0
                ? "text-red-400"
                : "text-green-400"
            }`}
          >
            {comparisonData.changes.rainfall >= 0 ? (
              <FaArrowUp />
            ) : (
              <FaArrowDown />
            )}
            {Math.abs(comparisonData.changes.rainfall).toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <FaChartLine className="text-orange-400 text-xl" />
            <div className="text-gray-400 text-sm">Thay đổi Chỉ số Rủi ro</div>
          </div>
          <div
            className={`text-2xl font-bold flex items-center gap-2 ${
              comparisonData.changes.risk >= 0
                ? "text-red-400"
                : "text-green-400"
            }`}
          >
            {comparisonData.changes.risk >= 0 ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(comparisonData.changes.risk).toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <FaExclamationTriangle className="text-red-400 text-xl" />
            <div className="text-gray-400 text-sm">
              Thay đổi Ngày Rủi ro Cao
            </div>
          </div>
          <div
            className={`text-2xl font-bold flex items-center gap-2 ${
              comparisonData.changes.highRiskDays >= 0
                ? "text-red-400"
                : "text-green-400"
            }`}
          >
            {comparisonData.changes.highRiskDays >= 0 ? (
              <FaArrowUp />
            ) : (
              <FaArrowDown />
            )}
            {Math.abs(comparisonData.changes.highRiskDays).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Period Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Period 1 */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {comparisonData.period1.label}
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Lượng mưa TB</span>
                <span className="text-white font-bold">
                  {Math.round(comparisonData.period1.avgRainfall)} mm
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(
                      (comparisonData.period1.avgRainfall / 200) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Chỉ số rủi ro TB</span>
                <span className="text-white font-bold">
                  {comparisonData.period1.avgRisk.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-orange-400 h-full rounded-full"
                  style={{
                    width: `${Math.min(
                      (comparisonData.period1.avgRisk / 5) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-gray-400 text-sm">Ngày rủi ro cao</div>
                <div className="text-xl font-bold text-red-400">
                  {comparisonData.period1.highRiskDays}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Tổng số ngày</div>
                <div className="text-xl font-bold text-white">
                  {comparisonData.period1.totalDays}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Period 2 */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {comparisonData.period2.label}
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Lượng mưa TB</span>
                <span className="text-white font-bold">
                  {Math.round(comparisonData.period2.avgRainfall)} mm
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(
                      (comparisonData.period2.avgRainfall / 200) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Chỉ số rủi ro TB</span>
                <span className="text-white font-bold">
                  {comparisonData.period2.avgRisk.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-orange-400 h-full rounded-full"
                  style={{
                    width: `${Math.min(
                      (comparisonData.period2.avgRisk / 5) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-gray-400 text-sm">Ngày rủi ro cao</div>
                <div className="text-xl font-bold text-red-400">
                  {comparisonData.period2.highRiskDays}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Tổng số ngày</div>
                <div className="text-xl font-bold text-white">
                  {comparisonData.period2.totalDays}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            Bảng so sánh chi tiết
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50 border-b border-gray-700">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Chỉ số
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Giai đoạn 1
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Giai đoạn 2
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Thay đổi
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="p-4 font-medium text-white">
                  Lượng mưa TB (mm)
                </td>
                <td className="p-4 text-gray-300">
                  {Math.round(comparisonData.period1.avgRainfall)}
                </td>
                <td className="p-4 text-gray-300">
                  {Math.round(comparisonData.period2.avgRainfall)}
                </td>
                <td className="p-4">
                  <span
                    className={`flex items-center gap-1 ${
                      comparisonData.changes.rainfall >= 0
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {comparisonData.changes.rainfall >= 0 ? (
                      <FaArrowUp size={14} />
                    ) : (
                      <FaArrowDown size={14} />
                    )}
                    {Math.abs(comparisonData.changes.rainfall).toFixed(1)}%
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="p-4 font-medium text-white">Chỉ số rủi ro TB</td>
                <td className="p-4 text-gray-300">
                  {comparisonData.period1.avgRisk.toFixed(2)}
                </td>
                <td className="p-4 text-gray-300">
                  {comparisonData.period2.avgRisk.toFixed(2)}
                </td>
                <td className="p-4">
                  <span
                    className={`flex items-center gap-1 ${
                      comparisonData.changes.risk >= 0
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {comparisonData.changes.risk >= 0 ? (
                      <FaArrowUp size={14} />
                    ) : (
                      <FaArrowDown size={14} />
                    )}
                    {Math.abs(comparisonData.changes.risk).toFixed(1)}%
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="p-4 font-medium text-white">Ngày rủi ro cao</td>
                <td className="p-4 text-gray-300">
                  {comparisonData.period1.highRiskDays}
                </td>
                <td className="p-4 text-gray-300">
                  {comparisonData.period2.highRiskDays}
                </td>
                <td className="p-4">
                  <span
                    className={`flex items-center gap-1 ${
                      comparisonData.changes.highRiskDays >= 0
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {comparisonData.changes.highRiskDays >= 0 ? (
                      <FaArrowUp size={14} />
                    ) : (
                      <FaArrowDown size={14} />
                    )}
                    {Math.abs(comparisonData.changes.highRiskDays).toFixed(1)}%
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="p-4 font-medium text-white">
                  Chỉ số rủi ro Max
                </td>
                <td className="p-4 text-gray-300">
                  {comparisonData.period1.maxRisk.toFixed(2)}
                </td>
                <td className="p-4 text-gray-300">
                  {comparisonData.period2.maxRisk.toFixed(2)}
                </td>
                <td className="p-4 text-gray-400">-</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">
                  Chỉ số rủi ro Min
                </td>
                <td className="p-4 text-gray-300">
                  {comparisonData.period1.minRisk.toFixed(2)}
                </td>
                <td className="p-4 text-gray-300">
                  {comparisonData.period2.minRisk.toFixed(2)}
                </td>
                <td className="p-4 text-gray-400">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparisonStatistics;
