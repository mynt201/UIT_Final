import { useMemo } from "react";
import { FaCloudRain, FaExclamationTriangle, FaCloud } from "react-icons/fa";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";
import { useWeather } from "../../../hooks/useWeather";
import type { WeatherData } from "../../../types/dataManagement";

interface WeatherForecastData {
  date: string;
  dayName: string;
  rainfall: number;
  temperature: number;
  humidity: number;
  isHeavyRain: boolean;
  isToday: boolean;
}

export default function WeatherForecast() {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  // Use React Query to fetch weather data
  const {
    data: weatherResponse,
    isLoading,
    error: weatherError,
  } = useWeather({
    limit: 100,
    sort: "date",
    order: "asc",
  });

  const weatherData = useMemo(
    () => weatherResponse?.weatherData || [],
    [weatherResponse],
  );
  const error = weatherError?.message || null;

  // Process weather data into forecast format
  const forecastData = useMemo<WeatherForecastData[]>(() => {
    if (weatherData.length === 0) {
      // Return empty array if no real data available (no more mock data fallback)
      return [];
    }

    // Group weather data by date and calculate averages
    const groupedByDate = weatherData.reduce((acc, item) => {
      const dateKey = item.date.split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(item);
      return acc;
    }, {} as Record<string, WeatherData[]>);

    // Convert to forecast format
    const dayNames = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];

    return Object.entries(groupedByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 7) // Take only first 7 days
      .map(([dateStr, dayData]) => {
        const date = new Date(dateStr);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        const avgRainfall =
          dayData.reduce((sum, item) => sum + item.rainfall, 0) /
          dayData.length;
        const avgTemperature =
          dayData.reduce((sum, item) => sum + item.temperature.current, 0) /
          dayData.length;
        const avgHumidity =
          dayData.reduce((sum, item) => sum + item.humidity, 0) /
          dayData.length;

        return {
          date: dateStr,
          dayName: isToday ? "Hôm nay" : dayNames[date.getDay()],
          rainfall: Math.round(avgRainfall),
          temperature: Math.round(avgTemperature),
          humidity: Math.round(avgHumidity),
          isHeavyRain: avgRainfall >= 100,
          isToday,
        };
      });
  }, [weatherData]);

  const hasHeavyRain = forecastData.some((day) => day.isHeavyRain);
  const heavyRainDays = forecastData.filter((day) => day.isHeavyRain);
  const upcomingRainWarnings = forecastData.filter(
    (day) => !day.isToday && day.isHeavyRain,
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (isLoading) {
    return (
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4 md:p-5`}
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              Đang tải dự báo thời tiết...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4 md:p-5`}
      >
        <div className="text-center py-8">
          <FaCloudRain className="mx-auto mb-2 text-gray-400" size={24} />
          <p className={`text-sm ${themeClasses.textSecondary}`}>{error}</p>
        </div>
      </div>
    );
  }

  // Show message when no weather data is available (after loading completes)
  if (!isLoading && forecastData.length === 0) {
    return (
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4 md:p-5`}
      >
        <div className="text-center py-8">
          <FaCloudRain className="mx-auto mb-2 text-gray-400" size={24} />
          <p className={`text-sm ${themeClasses.textSecondary}`}>
            Không có dữ liệu thời tiết
          </p>
          <p className={`text-xs mt-1 ${themeClasses.textSecondary}`}>
            Dữ liệu sẽ được cập nhật khi có sẵn
          </p>
        </div>
      </div>
    );
  }

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
          <h3
            className={`text-base md:text-lg font-semibold ${themeClasses.text}`}
          >
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
                      `${day.dayName} (${formatDate(day.date)}) - ${
                        day.rainfall
                      }mm`,
                  )
                  .join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Rain Warnings */}
      {upcomingRainWarnings.length > 0 && (
        <div
          className={`mb-4 p-3 rounded-lg border ${
            theme === "light"
              ? "bg-orange-50 border-orange-200 text-orange-800"
              : "bg-orange-900/20 border-orange-700 text-orange-300"
          }`}
        >
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="mt-0.5 shrink-0" size={18} />
            <div>
              <p className="font-semibold text-sm mb-1">
                ⚠️ Cảnh báo mưa lớn sắp tới
              </p>
              <p className="text-xs">
                Dự báo có mưa lớn vào:{" "}
                {upcomingRainWarnings
                  .map(
                    (day) =>
                      `${day.dayName} (${formatDate(day.date)}) - ${
                        day.rainfall
                      }mm`,
                  )
                  .join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Forecast Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3">
        {forecastData.map((day) => (
          <div
            key={day.date}
            className={`p-2 md:p-3 rounded-lg border ${
              day.isToday
                ? "border-red-500 bg-red-50/50"
                : day.isHeavyRain
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
              <div className={`text-xs ${themeClasses.textSecondary} mb-1`}>
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
