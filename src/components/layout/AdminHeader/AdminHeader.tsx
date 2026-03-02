import { useState, useEffect } from "react";
import { FaBell, FaSync, FaClock } from "react-icons/fa";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useAuth } from "../../../contexts/AuthContext";
import { getRoleLabel } from "../../../constants/roles";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";

dayjs.locale("vi");

interface AdminHeaderProps {
  onRefresh?: () => void;
}

export default function AdminHeader({ onRefresh }: AdminHeaderProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const themeClasses = getThemeClasses(theme);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return dayjs(date).format("dddd, DD [tháng] MMMM [năm] YYYY, HH:mm:ss");
  };

  const getInitials = () => {
    if (!user) return "?";
    if (user.full_name && user.full_name.trim()) {
      const parts = user.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return user.full_name.slice(0, 2).toUpperCase();
    }
    return (user.username || user.email || "A").slice(0, 2).toUpperCase();
  };

  const avatarUrl = user ? (user as { avatar_url?: string }).avatar_url : undefined;

  return (
    <header
      className={`${themeClasses.headerBg} border-b ${themeClasses.border} px-3 md:px-6 py-3 md:py-4 shrink-0`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
        <div>

          <p
            className={`text-xs md:text-sm mt-1 flex items-center gap-2 ${themeClasses.textSecondary}`}
          >
            <FaClock size={14} className="shrink-0" />
            <span>{formatTime(currentTime)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className={`p-2 rounded-lg transition-colors ${themeClasses.textSecondary
                } ${theme === "light"
                  ? "hover:text-gray-900 hover:bg-gray-200"
                  : "hover:text-white hover:bg-gray-700"
                }`}
              title="Làm mới dữ liệu"
            >
              <FaSync size={20} />
            </button>
          )}
          <button
            className={`p-2 rounded-lg transition-colors relative ${themeClasses.textSecondary
              } ${theme === "light"
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
            <div
              className={`w-8 h-8 md:w-9 md:h-9 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-xs font-semibold ${
                theme === "light" ? "bg-indigo-100 text-indigo-600" : "bg-indigo-900/50 text-indigo-300"
              }`}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                getInitials()
              )}
            </div>
            <div className="text-right min-w-0">
              <p
                className={`text-xs md:text-sm font-medium truncate ${themeClasses.text}`}
              >
                {user?.username || user?.email || "Admin"}
              </p>
              <p
                className={`text-xs hidden md:block ${themeClasses.textSecondary}`}
              >
                {user?.role ? getRoleLabel(user.role) : "Admin"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
