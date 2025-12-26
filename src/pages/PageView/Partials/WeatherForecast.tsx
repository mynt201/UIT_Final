import { useMemo } from "react";
import { FaCloudRain, FaExclamationTriangle, FaCloud } from "react-icons/fa";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";

interface WeatherForecastData {
  date: string;
  dayName: string;
  rainfall: number;
  temperature: number;
  humidity: number;
  isHeavyRain: boolean;
}

export default function WeatherForecast() {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  // Generate mock weather forecast for next 7 days
  const forecastData = useMemo<WeatherForecastData[]>(() => {
    const data: WeatherForecastData[] = [];
    const today = new Date();
    const dayNames = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];

    // Simple seeded random function
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const seed = date.getTime();
      
      const rainfall = Math.round(seededRandom(seed) * 200);
      const isHeavyRain = rainfall >= 100; // Mưa lớn >= 100mm
      const temperature = Math.round(25 + seededRandom(seed + 1) * 8);
      const humidity = Math.round(60 + seededRandom(seed + 2) * 30);

      data.push({
        date: date.toISOString().split("T")[0],
        dayName: i === 0 ? "Hôm nay" : dayNames[date.getDay()],
        rainfall,
        temperature,
        humidity,
        isHeavyRain,
      });
    }

    return data;
  }, []);

  const hasHeavyRain = forecastData.some((day) => day.isHeavyRain);
  const heavyRainDays = forecastData.filter((day) => day.isHeavyRain);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
  };

  return (
    <div
      className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4 md:p-5`}
    >
      {/* Header with Alert */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaCloudRain
            className={
              theme === "light" ? "text-indigo-600" : "text-indigo-400"
            }
            size={20}
          />
          <h3 className={`text-base md:text-lg font-semibold ${themeClasses.text}`}>
            Dự báo thời tiết 7 ngày tới
          </h3>
        </div>
        {hasHeavyRain && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              theme === "light"
                ? "bg-red-100 text-red-700"
                : "bg-red-900/30 text-red-300"
            }`}
          >
            <FaExclamationTriangle size={16} />
            <span className="text-xs md:text-sm font-medium">
              Cảnh báo mưa lớn
            </span>
          </div>
        )}
      </div>

      {/* Heavy Rain Alert */}
      {hasHeavyRain && (
        <div
          className={`mb-4 p-3 rounded-lg border ${
            theme === "light"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-red-900/20 border-red-700 text-red-300"
          }`}
        >
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="mt-0.5 shrink-0" size={18} />
            <div>
              <p className="font-semibold text-sm mb-1">
                Cảnh báo: Mưa lớn dự kiến
              </p>
              <p className="text-xs">
                Dự báo có mưa lớn vào:{" "}
                {heavyRainDays
                  .map(
                    (day) =>
                      `${day.dayName} (${formatDate(day.date)}) - ${day.rainfall}mm`,
                  )
                  .join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Forecast Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3">
        {forecastData.map((day, index) => (
          <div
            key={day.date}
            className={`p-2 md:p-3 rounded-lg border ${
              day.isHeavyRain
                ? theme === "light"
                  ? "bg-red-50 border-red-300"
                  : "bg-red-900/20 border-red-700"
                : `${themeClasses.backgroundSecondary} ${themeClasses.border}`
            }`}
          >
            <div className="text-center">
              <div
                className={`text-xs font-medium mb-1 ${
                  day.isHeavyRain
                    ? theme === "light"
                      ? "text-red-700"
                      : "text-red-300"
                    : themeClasses.textSecondary
                }`}
              >
                {day.dayName}
              </div>
              <div
                className={`text-xs mb-2 ${
                  day.isHeavyRain
                    ? theme === "light"
                      ? "text-red-600"
                      : "text-red-400"
                    : themeClasses.textSecondary
                }`}
              >
                {formatDate(day.date)}
              </div>
              <div className="flex justify-center mb-2">
                {day.isHeavyRain ? (
                  <FaCloudRain
                    className={
                      theme === "light" ? "text-red-600" : "text-red-400"
                    }
                    size={24}
                  />
                ) : day.rainfall > 0 ? (
                  <FaCloudRain
                    className={
                      theme === "light" ? "text-indigo-500" : "text-indigo-400"
                    }
                    size={20}
                  />
                ) : (
                  <FaCloud
                    className={
                      theme === "light" ? "text-gray-400" : "text-gray-500"
                    }
                    size={20}
                  />
                )}
              </div>
              <div className={`text-sm font-bold ${themeClasses.text} mb-1`}>
                {day.rainfall}mm
              </div>
              <div
                className={`text-xs ${themeClasses.textSecondary} mb-1`}
              >
                {day.temperature}°C
              </div>
              <div className={`text-xs ${themeClasses.textSecondary}`}>
                {day.humidity}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

