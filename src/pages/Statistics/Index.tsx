import { useState } from "react";
import dayjs from "dayjs";
import DailyStatistics from "./components/DailyStatistics";
import MonthlyStatistics from "./components/MonthlyStatistics";
import YearlyStatistics from "./components/YearlyStatistics";
import ComparisonStatistics from "./components/ComparisonStatistics";
import { getThemeClasses } from "../../utils/themeUtils";
import { useTheme } from "../../contexts/ThemeContext";
import ViewTabs from "./Partials/ViewTabs";
import type { ViewType } from "../../types";

const StatisticsPage = () => {
  const [activeView, setActiveView] = useState<ViewType>("daily");
  const [selectedYear, setSelectedYear] = useState<number>(
    dayjs().year(),
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    dayjs().month() + 1,
  );
  const [startDate, setStartDate] = useState<string>(
    dayjs().startOf('year').format('YYYY-MM-DD'),
  );
  const [endDate, setEndDate] = useState<string>(
    dayjs().format('YYYY-MM-DD'),
  );

  const renderContent = () => {
    switch (activeView) {
      case "daily":
        return (
          <DailyStatistics
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
          />
        );
      case "monthly":
        return (
          <MonthlyStatistics
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        );
      case "yearly":
        return <YearlyStatistics />;
      case "comparison":
        return (
          <ComparisonStatistics
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        );
      default:
        return null;
    }
  };

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div
      className={`p-4 md:p-6 space-y-4 md:space-y-6 ${themeClasses.background}`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 ${themeClasses.text}`}>
          Thống kê và Phân tích
        </h1>
        <p className={themeClasses.textSecondary}>
          Phân tích các chỉ số rủi ro ngập lụt theo thời gian và so sánh các
          giai đoạn
        </p>
      </div>

      {/* View Tabs */}
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg overflow-hidden`}
      >
        <ViewTabs activeView={activeView} onViewChange={setActiveView} />

        {/* Content */}
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
};

export default StatisticsPage;
