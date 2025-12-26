import { useMemo } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const YearlyStatistics = () => {
  const yearlyData = useMemo(() => {
    const years = [];
    const currentYear = new Date().getFullYear();

    // Simple seeded random function for consistent mock data
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i;
      const seed = year * 1000;
      // Mock data with seeded random for consistency
      const totalRainfall = 1200 + seededRandom(seed) * 800;
      const avgRisk = 2.0 + seededRandom(seed + 1) * 2.0;
      const highRiskMonths = Math.floor(seededRandom(seed + 2) * 6) + 2;
      const totalHighRiskDays = Math.floor(seededRandom(seed + 3) * 100) + 50;

      years.push({
        year,
        totalRainfall: Math.round(totalRainfall),
        avgRisk: parseFloat(avgRisk.toFixed(2)),
        highRiskMonths,
        totalHighRiskDays,
        maxRisk: parseFloat(
          (avgRisk + seededRandom(seed + 4) * 1.5).toFixed(2),
        ),
        minRisk: parseFloat(
          (avgRisk - seededRandom(seed + 5) * 0.5).toFixed(2),
        ),
      });
    }

    return years;
  }, []);

  const maxRainfall = Math.max(...yearlyData.map((y) => y.totalRainfall));
  const maxRisk = Math.max(...yearlyData.map((y) => y.avgRisk));

  // Calculate year-over-year changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
          <div className="text-gray-400 text-sm mb-2">Năm gần nhất</div>
          <div className="text-2xl font-bold text-white">
            {yearlyData[yearlyData.length - 1]?.year}
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
          <div className="text-gray-400 text-sm mb-2">Tổng lượng mưa</div>
          <div className="text-2xl font-bold text-white">
            {yearlyData[yearlyData.length - 1]?.totalRainfall.toLocaleString()}{" "}
            mm
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
          <div className="text-gray-400 text-sm mb-2">Chỉ số rủi ro TB</div>
          <div className="text-2xl font-bold text-white">
            {yearlyData[yearlyData.length - 1]?.avgRisk.toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
          <div className="text-gray-400 text-sm mb-2">Tháng rủi ro cao</div>
          <div className="text-2xl font-bold text-red-400">
            {yearlyData[yearlyData.length - 1]?.highRiskMonths} tháng
          </div>
        </div>
      </div>

      {/* Yearly Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rainfall Chart */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Tổng lượng mưa theo năm
          </h3>
          <div className="space-y-4">
            {yearlyData.map((data, index) => {
              const previousYear = yearlyData[index - 1];
              const change = previousYear
                ? calculateChange(
                    data.totalRainfall,
                    previousYear.totalRainfall,
                  )
                : 0;
              return (
                <div key={data.year} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">
                      Năm {data.year}
                    </span>
                    <div className="flex items-center gap-2">
                      {previousYear && (
                        <span
                          className={`text-xs flex items-center gap-1 ${
                            change >= 0 ? "text-red-400" : "text-green-400"
                          }`}
                        >
                          {change >= 0 ? (
                            <FaArrowUp size={12} />
                          ) : (
                            <FaArrowDown size={12} />
                          )}
                          {Math.abs(change).toFixed(1)}%
                        </span>
                      )}
                      <span className="text-white font-bold">
                        {data.totalRainfall.toLocaleString()} mm
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all"
                      style={{
                        width: `${(data.totalRainfall / maxRainfall) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Index Chart */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Chỉ số rủi ro trung bình theo năm
          </h3>
          <div className="space-y-4">
            {yearlyData.map((data, index) => {
              const previousYear = yearlyData[index - 1];
              const change = previousYear
                ? calculateChange(data.avgRisk, previousYear.avgRisk)
                : 0;
              const riskColor =
                data.avgRisk >= 3.5
                  ? "bg-red-500"
                  : data.avgRisk >= 2.0
                  ? "bg-orange-400"
                  : "bg-green-400";
              return (
                <div key={data.year} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">
                      Năm {data.year}
                    </span>
                    <div className="flex items-center gap-2">
                      {previousYear && (
                        <span
                          className={`text-xs flex items-center gap-1 ${
                            change >= 0 ? "text-red-400" : "text-green-400"
                          }`}
                        >
                          {change >= 0 ? (
                            <FaArrowUp size={12} />
                          ) : (
                            <FaArrowDown size={12} />
                          )}
                          {Math.abs(change).toFixed(1)}%
                        </span>
                      )}
                      <span className="text-white font-bold">
                        {data.avgRisk.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
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

      {/* Yearly Comparison Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">So sánh các năm</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50 border-b border-gray-700">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Năm
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Tổng lượng mưa (mm)
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Chỉ số rủi ro TB
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Chỉ số Max
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Chỉ số Min
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Tháng rủi ro cao
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Ngày rủi ro cao
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-300">
                  Thay đổi
                </th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map((data, index) => {
                const previousYear = yearlyData[index - 1];
                const change = previousYear
                  ? calculateChange(data.avgRisk, previousYear.avgRisk)
                  : null;
                return (
                  <tr
                    key={data.year}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-4 font-medium text-white">{data.year}</td>
                    <td className="p-4 text-gray-300">
                      {data.totalRainfall.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white">
                        {data.avgRisk.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">
                      {data.maxRisk.toFixed(2)}
                    </td>
                    <td className="p-4 text-gray-300">
                      {data.minRisk.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className="text-red-400 font-medium">
                        {data.highRiskMonths}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">
                      {data.totalHighRiskDays}
                    </td>
                    <td className="p-4">
                      {change !== null ? (
                        <span
                          className={`flex items-center gap-1 ${
                            change >= 0 ? "text-red-400" : "text-green-400"
                          }`}
                        >
                          {change >= 0 ? (
                            <FaArrowUp size={14} />
                          ) : (
                            <FaArrowDown size={14} />
                          )}
                          {Math.abs(change).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default YearlyStatistics;
