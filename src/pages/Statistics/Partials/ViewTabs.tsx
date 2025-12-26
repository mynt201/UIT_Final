import {
  FaChartLine,
  FaChartBar,
  FaCalendarAlt,
  FaFilter,
} from "react-icons/fa";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";
import type { ViewType } from "../../../types";

interface ViewTabsProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function ViewTabs({ activeView, onViewChange }: ViewTabsProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const views = [
    {
      id: "daily" as ViewType,
      label: "Thống kê theo Ngày",
      icon: FaCalendarAlt,
    },
    {
      id: "monthly" as ViewType,
      label: "Thống kê theo Tháng",
      icon: FaChartBar,
    },
    {
      id: "yearly" as ViewType,
      label: "Thống kê theo Năm",
      icon: FaChartLine,
    },
    {
      id: "comparison" as ViewType,
      label: "So sánh Giai đoạn",
      icon: FaFilter,
    },
  ];

  return (
    <div className={`flex border-b ${themeClasses.border} overflow-x-auto`}>
      {views.map((view) => {
        const Icon = view.icon;
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeView === view.id
                ? theme === "light"
                  ? "bg-indigo-600 text-white border-b-2 border-indigo-400"
                  : "bg-indigo-500 text-white border-b-2 border-indigo-400"
                : `${themeClasses.textSecondary} ${
                    theme === "light"
                      ? "hover:text-gray-900 hover:bg-gray-200"
                      : "hover:text-white hover:bg-gray-700"
                  }`
            }`}
          >
            <Icon size={18} />
            <span>{view.label}</span>
          </button>
        );
      })}
    </div>
  );
}

