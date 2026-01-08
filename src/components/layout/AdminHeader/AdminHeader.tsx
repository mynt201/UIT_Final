import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaUserCircle, FaSync, FaHome } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";
import { HOME_PATH } from "../../../router/routePath";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";

interface AdminHeaderProps {
  onRefresh?: () => void;
}

export default function AdminHeader({ onRefresh }: AdminHeaderProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const themeClasses = getThemeClasses(theme);
  const [currentTime, setCurrentTime] = useState(new Date());

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleGoToHome = () => {
    navigate(HOME_PATH);
  };

  return (
    <header
      className={`${themeClasses.headerBg} border-b ${themeClasses.border} px-3 md:px-6 py-3 md:py-4 shrink-0`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
        <div>
          <h2
            className={`text-lg md:text-xl font-semibold ${themeClasses.text}`}
          >
            Dashboard Quản Trị
          </h2>
          <p
            className={`text-xs md:text-sm mt-1 ${themeClasses.textSecondary}`}
          >
            {formatTime(currentTime)}
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
          {!isAdmin && (
            <button
              onClick={handleGoToHome}
              className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 text-white rounded-lg transition-colors text-xs md:text-sm ${
                theme === "light"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
              title="Quay về Trang chủ"
            >
              <FaHome size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden md:inline whitespace-nowrap">
                Trang chủ
              </span>
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className={`p-2 rounded-lg transition-colors ${
                themeClasses.textSecondary
              } ${
                theme === "light"
                  ? "hover:text-gray-900 hover:bg-gray-200"
                  : "hover:text-white hover:bg-gray-700"
              }`}
              title="Làm mới dữ liệu"
            >
              <FaSync size={20} />
            </button>
          )}
          <button
            className={`p-2 rounded-lg transition-colors relative ${
              themeClasses.textSecondary
            } ${
              theme === "light"
                ? "hover:text-gray-900 hover:bg-gray-200"
                : "hover:text-white hover:bg-gray-700"
            }`}
            title="Thông báo"
          >
            <FaBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div
            className={`flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l ${themeClasses.border}`}
          >
            <FaUserCircle
              size={20}
              className={`md:w-6 md:h-6 shrink-0 ${themeClasses.textSecondary}`}
            />
            <div className="text-right min-w-0">
              <p
                className={`text-xs md:text-sm font-medium truncate ${themeClasses.text}`}
              >
                {user?.username || user?.email || "Admin"}
              </p>
              <p
                className={`text-xs hidden md:block ${themeClasses.textSecondary}`}
              >
                {user?.role === "admin" ? "Quản trị viên" : "Người dùng"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
