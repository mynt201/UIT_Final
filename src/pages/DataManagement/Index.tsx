import { useState } from "react";
import {
  FaMapMarkedAlt,
  FaCloudRain,
  FaWater,
  FaRoad,
  FaChartLine,
  FaDownload,
} from "react-icons/fa";
import WardDataManagement from "./components/WardDataManagement";
import WeatherDataManagement from "./components/WeatherDataManagement";
import DrainageDataManagement from "./components/DrainageDataManagement";
import RoadBridgeDataManagement from "./components/RoadBridgeDataManagement";
import RiskIndexManagement from "./components/RiskIndexManagement";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";
import { Button } from "../../components";
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

  // Function to download Excel template based on active tab
  const downloadTemplate = () => {
    const templateUrls = {
      ward: "/templates/ward-data-template.csv",
      weather: "/templates/weather-data-template.csv",
      drainage: "/templates/drainage-data-template.csv",
      "road-bridge": "/templates/road-bridge-data-template.csv",
      "risk-index": "/templates/risk-index-data-template.csv",
    };

    const templateUrl = templateUrls[activeTab];
    const currentTab = tabs.find(tab => tab.id === activeTab);

    try {
      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = templateUrl;
      link.download = `${currentTab?.label.replace(/\s+/g, '_').toLowerCase()}_template.csv`;
      link.target = "_blank"; // Open in new tab if download fails
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Template download error:", error);
      // Fallback: Show template structure in alert
      const templateStructure = getTemplateStructure(activeTab);
      alert(`Template cho ${currentTab?.label}:\n\nCấu trúc cột: ${templateStructure}\n\nVui lòng tạo file CSV với các cột theo thứ tự trên và điền dữ liệu phù hợp.`);
    }
  };

  // Function to get template structure description
  const getTemplateStructure = (tabId: TabType): string => {
    const structures = {
      ward: "Mã phường xã,Tên phường xã,Quận huyện,Tỉnh thành phố,Dân số,Diện tích (km²),Tọa độ,Mô tả",
      weather: "Ngày,Mã phường xã,Nhiệt độ (°C),Độ ẩm (%),Tốc độ gió (km/h),Hướng gió,Lượng mưa (mm),Áp suất (hPa),Mô tả thời tiết",
      drainage: "Mã cống,Mã phường xã,Loại cống,Chiều dài (m),Đường kính (m),Vật liệu,Tọa độ,Trạng thái,Bảo trì cuối,Mô tả",
      "road-bridge": "Mã công trình,Mã phường xã,Loại công trình,Tên công trình,Chiều dài (m),Chiều rộng (m),Chiều cao (m),Vật liệu,Tọa độ,Trạng thái,Kiểm tra cuối,Mô tả",
      "risk-index": "Mã phường xã,Ngày đánh giá,Rủi ro mưa,Rủi ro thoát nước,Rủi ro lịch sử ngập,Rủi ro địa hình,Rủi ro mật độ dân số,Rủi ro tổng thể,Mô tả đánh giá"
    };
    return structures[tabId] || "Không có cấu trúc template";
  };

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
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className={`text-3xl font-bold mb-2 ${themeClasses.text}`}>
              Quản lý Dữ liệu Bản đồ
            </h1>
            <p className={themeClasses.textSecondary}>
              Upload và quản lý các chỉ số, vị trí cho hệ thống đánh giá rủi ro ngập
              lụt
            </p>
          </div>
          <div className="ml-4">
            <Button
              variant="secondary"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <FaDownload />
              <span>Tải Template CSV</span>
            </Button>
          </div>
        </div>
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
