import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoIosListBox, IoIosPrint, IoIosPodium } from 'react-icons/io';
import { IoMdPerson, IoMdSettings } from 'react-icons/io';
import { FaTachometerAlt } from 'react-icons/fa';
import { getCurrentUser } from '../../../pages/Login/authService';
import { ADMIN_PATH } from '../../../router/routePath';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';

interface SidebarProps {
  onExportClick?: () => void;
}

export default function Sidebar({ onExportClick }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const isAdmin = user?.role === 'admin';

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getActiveClass = (path: string) => {
    return isActive(path)
      ? theme === "light"
        ? "bg-indigo-600 text-white"
        : "bg-indigo-500 text-white"
      : `${themeClasses.textSecondary} ${
          theme === "light" ? "hover:bg-gray-200" : "hover:bg-gray-700"
        }`;
  };

  const handleExportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onExportClick) {
      onExportClick();
    }
  };

  const handleGoToDashboard = () => {
    navigate(ADMIN_PATH);
  };

  return (
    <aside
      className={`hidden md:flex w-64 flex-col h-screen shrink-0 ${themeClasses.sidebar} ${themeClasses.text}`}
    >
      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {isAdmin && (
          <button
            onClick={handleGoToDashboard}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              theme === "light"
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-indigo-500 hover:bg-indigo-600 text-white"
            }`}
          >
            <FaTachometerAlt size={20} />
            <span>Trở về Dashboard</span>
          </button>
        )}

        <Link
          to="/"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
            "/",
          )}`}
        >
          <IoIosListBox size={20} />
          <span>Đánh giá rủi ro ngập lụt</span>
        </Link>

        <Link
          to="/risk-report"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
            "/risk-report",
          )}`}
        >
          <IoIosPodium size={20} />
          <span>Báo cáo rủi ro</span>
        </Link>

        <button
          onClick={handleExportClick}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            themeClasses.textSecondary
          } ${
            theme === "light" ? "hover:bg-gray-200" : "hover:bg-gray-700"
          }`}
        >
          <IoIosPrint size={20} />
          <span>Xuất dữ liệu</span>
        </button>

        <div className={`pt-4 mt-4 border-t ${themeClasses.border}`}>
          <Link
            to="/profile"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
              "/profile",
            )}`}
          >
            <IoMdPerson size={20} />
            <span>Thông tin cá nhân</span>
          </Link>

          <Link
            to="/settings"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
              "/settings",
            )}`}
          >
            <IoMdSettings size={20} />
            <span>Cài đặt</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
