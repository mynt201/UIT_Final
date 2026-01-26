import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";
import type { 
  RiskDistributionItem, 
  TooltipProps, 
  PieChartData, 
  BarChartData 
} from "../../../types";

interface RiskDistributionChartProps {
  riskDistribution: RiskDistributionItem[];
  totalWards: number;
}

// CustomTooltip component defined outside to avoid recreation during render
function CustomTooltip({ active, payload }: TooltipProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  if (active && payload && payload.length > 0) {
    const firstPayload = payload[0];
    const percentage = firstPayload.payload?.percentage;
    
    return (
      <div
        className={`${
          theme === "light" ? "bg-white" : "bg-gray-800"
        } border ${themeClasses.border} rounded-lg p-3 shadow-lg`}
      >
        <p className={`font-semibold ${themeClasses.text}`}>
          {firstPayload.name}
        </p>
        <p className={`${themeClasses.textSecondary}`}>
          Số lượng: <span className="font-bold">{firstPayload.value}</span>
        </p>
        {percentage !== undefined && (
          <p className={`${themeClasses.textSecondary}`}>
            Tỷ lệ:{" "}
            <span className="font-bold">
              {typeof percentage === 'number' ? percentage.toFixed(1) : '0.0'}%
            </span>
          </p>
        )}
      </div>
    );
  }
  return null;
}

export default function RiskDistributionChart({
  riskDistribution,
  totalWards,
}: RiskDistributionChartProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const colorMap: { [key: string]: string } = {
    Cao: "#ef4444",
    "Trung Bình": "#fb923c",
    Thấp: "#4ade80",
  };

  // Prepare data for Pie Chart
  const pieData: PieChartData[] = riskDistribution.map((item) => ({
    name: item.label,
    value: item.count,
    color: colorMap[item.label] || "#gray",
    percentage: item.percentage,
  }));

  // Prepare data for Bar Chart
  const barData: BarChartData[] = riskDistribution.map((item) => ({
    name: item.label,
    value: item.count,
    percentage: item.percentage,
    fill: colorMap[item.label] || "#gray",
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <div className="flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => {
                const total = pieData.reduce((sum, item) => sum + item.value, 0);
                const percentage = (value / total) * 100;
                return `${name}: ${percentage.toFixed(1)}%`;
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        <div>
          <h3
            className={`text-sm font-semibold mb-4 ${themeClasses.textSecondary}`}
          >
            Phân bố theo số lượng
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={{ fill: theme === "light" ? "#374151" : "#d1d5db" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {riskDistribution.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 rounded-lg hover:bg-opacity-10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colorMap[item.label] }}
                ></div>
                <span className={`font-medium ${themeClasses.text}`}>
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-bold ${themeClasses.text}`}>
                  {item.count}
                </span>
                <span className={`text-sm ${themeClasses.textSecondary}`}>
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className={`mt-4 pt-4 border-t ${themeClasses.border}`}>
          <div className="flex justify-between items-center">
            <span
              className={`text-sm font-medium ${themeClasses.textSecondary}`}
            >
              Tổng số phường/xã
            </span>
            <span className={`text-lg font-bold ${themeClasses.text}`}>
              {totalWards}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

