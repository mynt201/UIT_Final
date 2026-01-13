import { mockWards } from "../PageView/Partials/mockData";
import {
  calcFloodRiskIndex,
  getRiskLevel,
  getRiskLevelLabel,
} from "../PageView/Partials/floodRiskUtils";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";
import { formatNumber } from "../../utils/formatUtils";
import { Button } from "../../components";

export default function RiskReportPage() {
  const wardStats = mockWards.map((ward) => {
    const exposure = ward.population_density / 1000 + ward.rainfall / 200;
    const susceptibility = ward.low_elevation + ward.urban_land;
    const resilience = ward.drainage_capacity || 1;
    const floodRisk = calcFloodRiskIndex(exposure, susceptibility, resilience);
    const riskLevel = getRiskLevel(floodRisk);
    const levelLabel = getRiskLevelLabel(riskLevel);

    return {
      ...ward,
      exposure,
      susceptibility,
      resilience,
      flood_risk: floodRisk,
      risk_level: levelLabel,
    };
  });

  const highRisk = wardStats.filter((w) => w.risk_level === "Cao").length;
  const mediumRisk = wardStats.filter(
    (w) => w.risk_level === "Trung Bình",
  ).length;
  const lowRisk = wardStats.filter((w) => w.risk_level === "Thấp").length;

  const avgRisk =
    wardStats.reduce((sum, w) => sum + w.flood_risk, 0) / wardStats.length;
  const maxRisk = Math.max(...wardStats.map((w) => w.flood_risk));
  const avgPopulation =
    wardStats.reduce((sum, w) => sum + w.population_density, 0) /
    wardStats.length;
  const avgRainfall =
    wardStats.reduce((sum, w) => sum + w.rainfall, 0) / wardStats.length;

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className="w-full h-full p-4 md:p-6 flex flex-col overflow-y-auto overflow-x-hidden">
      <div
        className={`${themeClasses.text} text-2xl md:text-3xl font-bold mb-4`}
      >
        Báo cáo rủi ro ngập lụt
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
          <div className="text-red-400 text-sm mb-1">Rủi ro cao</div>
          <div className={`${themeClasses.text} text-3xl font-bold`}>
            {highRisk}
          </div>
          <div className="text-red-400 text-xs mt-1">
            {((highRisk / wardStats.length) * 100).toFixed(1)}% tổng số
          </div>
        </div>
        <div className="bg-orange-300/20 border border-orange-300 rounded-lg p-4">
          <div className="text-orange-300 text-sm mb-1">Rủi ro trung bình</div>
          <div className={`${themeClasses.text} text-3xl font-bold`}>
            {mediumRisk}
          </div>
          <div className="text-orange-300 text-xs mt-1">
            {((mediumRisk / wardStats.length) * 100).toFixed(1)}% tổng số
          </div>
        </div>
        <div className="bg-green-300/20 border border-green-300 rounded-lg p-4">
          <div className="text-green-300 text-sm mb-1">Rủi ro thấp</div>
          <div className={`${themeClasses.text} text-3xl font-bold`}>
            {lowRisk}
          </div>
          <div className="text-green-300 text-xs mt-1">
            {((lowRisk / wardStats.length) * 100).toFixed(1)}% tổng số
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4`}
        >
          <div className={`${themeClasses.textSecondary} text-xs mb-1`}>
            Chỉ số TB
          </div>
          <div className={`${themeClasses.text} text-2xl font-bold`}>
            {avgRisk.toFixed(2)}
          </div>
        </div>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4`}
        >
          <div className={`${themeClasses.textSecondary} text-xs mb-1`}>
            Chỉ số cao nhất
          </div>
          <div className={`${themeClasses.text} text-2xl font-bold`}>
            {maxRisk.toFixed(2)}
          </div>
        </div>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4`}
        >
          <div className={`${themeClasses.textSecondary} text-xs mb-1`}>
            Mật độ dân số TB
          </div>
          <div className={`${themeClasses.text} text-2xl font-bold`}>
            {formatNumber(Math.round(avgPopulation))}
          </div>
        </div>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4`}
        >
          <div className={`${themeClasses.textSecondary} text-xs mb-1`}>
            Lượng mưa TB
          </div>
          <div className={`${themeClasses.text} text-2xl font-bold`}>
            {avgRainfall.toFixed(0)} mm
          </div>
        </div>
      </div>

      <div
        className={`${themeClasses.container} rounded-xl shadow-2xl overflow-hidden flex-1 flex flex-col`}
      >
        <div className="overflow-x-auto flex-1">
          <div className="h-full overflow-y-auto">
            <table className={`w-full ${themeClasses.text}`}>
              <thead
                className={`sticky top-0 z-10 border-b ${themeClasses.border} ${themeClasses.backgroundSecondary}`}
              >
                <tr>
                  <th
                    className={`text-left p-2 text-xs font-semibold ${themeClasses.textSecondary}`}
                  >
                    STT
                  </th>
                  <th
                    className={`text-left p-2 text-xs font-semibold ${themeClasses.textSecondary}`}
                  >
                    Tên phường/xã
                  </th>
                  <th
                    className={`text-left p-2 text-xs font-semibold ${themeClasses.textSecondary}`}
                  >
                    Chỉ số rủi ro
                  </th>
                  <th
                    className={`text-left p-2 text-xs font-semibold ${themeClasses.textSecondary}`}
                  >
                    Mức độ
                  </th>
                  <th
                    className={`text-left p-2 text-xs font-semibold ${themeClasses.textSecondary}`}
                  >
                    Mật độ dân số
                  </th>
                  <th
                    className={`text-left p-2 text-xs font-semibold ${themeClasses.textSecondary}`}
                  >
                    Lượng mưa
                  </th>
                  <th
                    className={`text-left p-2 text-xs font-semibold ${themeClasses.textSecondary}`}
                  >
                    Độ cao thấp
                  </th>
                  <th
                    className={`text-left p-2 text-xs font-semibold ${themeClasses.textSecondary}`}
                  >
                    Đất đô thị
                  </th>
                  <th
                    className={`text-left p-2 text-xs font-semibold ${themeClasses.textSecondary}`}
                  >
                    Khả năng thoát nước
                  </th>
                  <th
                    className={`text-left p-2 text-xs font-semibold ${themeClasses.textSecondary}`}
                  >
                    Exposure
                  </th>
                  <th
                    className={`text-left p-2 text-xs font-semibold ${themeClasses.textSecondary}`}
                  >
                    Susceptibility
                  </th>
                  <th
                    className={`text-left p-2 text-xs font-semibold ${themeClasses.textSecondary}`}
                  >
                    Resilience
                  </th>
                </tr>
              </thead>
              <tbody>
                {wardStats
                  .sort((a, b) => b.flood_risk - a.flood_risk)
                  .map((ward, index) => (
                    <tr
                      key={ward.ward_name}
                      className={`border-b ${themeClasses.border} ${
                        theme === "light"
                          ? "hover:bg-gray-100"
                          : "hover:bg-gray-800/50"
                      } transition-colors`}
                    >
                      <td className={`p-3 ${themeClasses.textSecondary}`}>
                        {index + 1}
                      </td>
                      <td className={`p-3 font-medium ${themeClasses.text}`}>
                        {ward.ward_name}
                      </td>
                      <td className={`p-3 ${themeClasses.text}`}>
                        <span className="font-bold">
                          {ward.flood_risk.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            ward.risk_level === "Cao"
                              ? "bg-red-500/20 text-red-400"
                              : ward.risk_level === "Trung Bình"
                              ? "bg-orange-300/20 text-orange-300"
                              : "bg-green-300/20 text-green-300"
                          }`}
                        >
                          {ward.risk_level}
                        </span>
                      </td>
                      <td className={`p-3 ${themeClasses.text}`}>
                        {ward.population_density.toLocaleString()} người/km²
                      </td>
                      <td className={`p-3 ${themeClasses.text}`}>
                        {ward.rainfall} mm
                      </td>
                      <td className={`p-3 ${themeClasses.text}`}>
                        {ward.low_elevation.toFixed(1)} m
                      </td>
                      <td className={`p-3 ${themeClasses.text}`}>
                        {ward.urban_land.toFixed(1)}
                      </td>
                      <td className={`p-3 ${themeClasses.text}`}>
                        {ward.drainage_capacity.toFixed(1)}
                      </td>
                      <td
                        className={`p-3 ${themeClasses.textSecondary} text-sm`}
                      >
                        {ward.exposure.toFixed(2)}
                      </td>
                      <td
                        className={`p-3 ${themeClasses.textSecondary} text-sm`}
                      >
                        {ward.susceptibility.toFixed(2)}
                      </td>
                      <td
                        className={`p-3 ${themeClasses.textSecondary} text-sm`}
                      >
                        {ward.resilience.toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-3 shrink-0">
        <Button variant="primary" onClick={() => window.print()}>
          In báo cáo
        </Button>
      </div>
    </div>
  );
}
