import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaChartLine,
  FaUsers,
  FaSignOutAlt,
  FaMapMarkedAlt,
} from 'react-icons/fa';
import { IoIosListBox, IoIosPrint, IoIosPodium } from 'react-icons/io';
import { IoMdPerson, IoMdSettings } from 'react-icons/io';
import { useAuth } from '../../../contexts/AuthContext';
import logo from '../../../assets/logo.jpg';
import {
  HOME_PATH,
  RISK_REPORT_PATH,
  SETTINGS_PATH,
  LOGIN_PATH,
  ADMIN_DATA_MANAGEMENT_PATH,
  ADMIN_USER_MANAGEMENT_PATH,
  ADMIN_STATISTICS_PATH,
  ADMIN_PATH,
} from '../../../router/routePath';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';

interface SidebarProps {
  isAdmin?: boolean;
  onExportClick?: () => void;
}

export default function Sidebar({ isAdmin = false, onExportClick }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === ADMIN_PATH && isAdmin) {
      return location.pathname === ADMIN_PATH;
    }
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getActiveClass = (path: string) => {
    return isActive(path)
      ? theme === 'light'
        ? 'bg-indigo-600 text-white'
        : 'bg-indigo-500 text-white'
      : `${themeClasses.textSecondary} ${
          theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700'
        }`;
  };

  const handleLogout = () => {
    logout();
    navigate(LOGIN_PATH);
  };

  const handleExportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onExportClick) {
      onExportClick();
    }
  };

  return (
    <aside
      className={`hidden md:flex w-64 flex-col h-screen shrink-0 ${themeClasses.sidebar} ${themeClasses.text}`}
    >
      {/* Logo/Header */}
      {isAdmin && (
        <div className={`p-6 border-b ${themeClasses.border}`}>
          <div className='flex items-center gap-3 mb-2'>
            <img src={logo} className='w-10 h-10 rounded-lg' alt='Logo' />
            <div>
              <h1 className={`text-lg font-bold ${themeClasses.text}`}>
                {isAdmin ? 'Admin Panel' : 'Flood Risk System'}
              </h1>
              <p className={`text-xs ${themeClasses.textSecondary}`}>
                {isAdmin ? 'Quản trị hệ thống' : 'Đánh giá rủi ro ngập lụt'}
              </p>
            </div>
          </div>
          {user && (
            <div className={`mt-3 pt-3 border-t ${themeClasses.border}`}>
              <p className={`text-xs ${themeClasses.textSecondary}`}>Đăng nhập bởi</p>
              <p className={`text-sm font-medium ${themeClasses.text} mt-1`}>
                {user.username || user.email}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation Menu */}
      <nav className={`flex-1 ${isAdmin ? 'p-4' : 'p-4 pt-6'} space-y-2`}>
        {/* Admin Navigation - Full Features */}
        {isAdmin && (
          <>
            {/* Main Dashboard */}
            <Link
              to={ADMIN_PATH}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
                ADMIN_PATH
              )}`}
            >
              <FaTachometerAlt size={20} />
              <span>Dashboard</span>
            </Link>

            {/* Core Features */}
            <Link
              to={HOME_PATH}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
                HOME_PATH
              )}`}
            >
              <IoIosListBox size={20} />
              <span>Đánh giá rủi ro ngập lụt</span>
            </Link>

            <Link
              to={RISK_REPORT_PATH}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
                RISK_REPORT_PATH
              )}`}
            >
              <IoIosPodium size={20} />
              <span>Báo cáo rủi ro</span>
            </Link>

            <Link
              to={ADMIN_STATISTICS_PATH}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
                ADMIN_STATISTICS_PATH
              )}`}
            >
              <FaChartLine size={20} />
              <span>Thống kê & Phân tích</span>
            </Link>

            <button
              onClick={handleExportClick}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                themeClasses.textSecondary
              } ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700'}`}
            >
              <IoIosPrint size={20} />
              <span>Xuất dữ liệu</span>
            </button>

            <div className={`pt-4 mt-4 border-t ${themeClasses.border}`}>
              <div
                className={`px-4 py-2 text-xs uppercase tracking-wider ${themeClasses.textSecondary}`}
              >
                Quản lý
              </div>

              <Link
                to={ADMIN_DATA_MANAGEMENT_PATH}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
                  ADMIN_DATA_MANAGEMENT_PATH
                )}`}
              >
                <FaMapMarkedAlt size={20} />
                <span>Quản lý dữ liệu</span>
              </Link>

              <Link
                to={ADMIN_USER_MANAGEMENT_PATH}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
                  ADMIN_USER_MANAGEMENT_PATH
                )}`}
              >
                <FaUsers size={20} />
                <span>Quản lý người dùng</span>
              </Link>
            </div>
          </>
        )}

        {/* User Navigation */}
        {!isAdmin && (
          <>
            <Link
              to='/'
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
                '/'
              )}`}
            >
              <IoIosListBox size={20} />
              <span>Đánh giá rủi ro ngập lụt</span>
            </Link>

            <Link
              to='/risk-report'
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
                '/risk-report'
              )}`}
            >
              <IoIosPodium size={20} />
              <span>Báo cáo rủi ro</span>
            </Link>

            <button
              onClick={handleExportClick}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                themeClasses.textSecondary
              } ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700'}`}
            >
              <IoIosPrint size={20} />
              <span>Xuất dữ liệu</span>
            </button>
          </>
        )}

        {/* Common Settings Section */}
        <div className={`pt-4 mt-4 border-t ${themeClasses.border}`}>
          <Link
            to='/profile'
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
              '/profile'
            )}`}
          >
            <IoMdPerson size={20} />
            <span>Thông tin cá nhân</span>
          </Link>

          <Link
            to={SETTINGS_PATH}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
              SETTINGS_PATH
            )}`}
          >
            <IoMdSettings size={20} />
            <span>Cài đặt</span>
          </Link>
        </div>
      </nav>

      {/* Footer/Logout */}
      <div className={`p-4 border-t ${themeClasses.border}`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            themeClasses.textSecondary
          } ${
            theme === 'light'
              ? 'hover:bg-red-100 hover:text-red-600'
              : 'hover:bg-red-600 hover:text-white'
          }`}
        >
          <FaSignOutAlt size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
