import { useState } from "react";
import {
  FaMapMarkedAlt,
  FaCloudRain,
  FaWater,
  FaRoad,
  FaChartLine,
} from "react-icons/fa";
import WardDataManagement from "./components/WardDataManagement";
import WeatherDataManagement from "./components/WeatherDataManagement";
import DrainageDataManagement from "./components/DrainageDataManagement";
import RoadBridgeDataManagement from "./components/RoadBridgeDataManagement";
import RiskIndexManagement from "./components/RiskIndexManagement";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";
import type { TabType } from "../../types";

const DataManagementPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("ward");

  const tabs = [
    {
      id: "ward" as TabType,
      label: "Quản lý Phường/Xã",
      icon: FaMapMarkedAlt,
    },
    {
      id: "weather" as TabType,
      label: "Dữ liệu Thời tiết",
      icon: FaCloudRain,
    },
    {
      id: "drainage" as TabType,
      label: "Hệ thống Thoát nước",
      icon: FaWater,
    },
    {
      id: "road-bridge" as TabType,
      label: "Cầu và Đường",
      icon: FaRoad,
    },
    {
      id: "risk-index" as TabType,
      label: "Chỉ số Rủi ro",
      icon: FaChartLine,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "ward":
        return <WardDataManagement />;
      case "weather":
        return <WeatherDataManagement />;
      case "drainage":
        return <DrainageDataManagement />;
      case "road-bridge":
        return <RoadBridgeDataManagement />;
      case "risk-index":
        return <RiskIndexManagement />;
      default:
        return <WardDataManagement />;
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
          Quản lý Dữ liệu Bản đồ
        </h1>
        <p className={themeClasses.textSecondary}>
          Upload và quản lý các chỉ số, vị trí cho hệ thống đánh giá rủi ro ngập
          lụt
        </p>
      </div>

      {/* Tabs */}
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg overflow-hidden`}
      >
        <div className={`flex border-b ${themeClasses.border} overflow-x-auto`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
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
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
};

export default DataManagementPage;
