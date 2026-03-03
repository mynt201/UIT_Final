import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaMapMarkedAlt } from 'react-icons/fa';
import { IoIosPodium } from 'react-icons/io';
import { IoMdPerson, IoMdSettings } from 'react-icons/io';
import type { User } from '../../../types/auth';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import FloodGuardLogo from '../../../assets/FloodGuardLogo';
import { RISK_REPORT_PATH, SETTINGS_PATH, LOGIN_PATH, HOME_PATH } from '../../../router/routePath';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';

function getUserInitials(user: User) {
  const name = user.full_name?.trim();
  if (name) {
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return (user.username || user.email || "U").slice(0, 2).toUpperCase();
}

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const themeClasses = getThemeClasses(theme);

  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getActiveClass = (path: string) => {
    return isActive(path)
      ? theme === 'light'
        ? 'bg-indigo-600 text-white font-medium'
        : 'bg-indigo-600 text-white font-medium'
      : `${themeClasses.text} ${
          theme === 'light' ? 'hover:bg-gray-100 hover:text-gray-900' : 'hover:bg-gray-800 hover:text-white'
        }`;
  };

  const handleLogout = () => {
    logout();
    navigate(HOME_PATH);
  };

  return (
    <aside
      className={`hidden md:flex w-64 flex-col h-screen shrink-0 ${themeClasses.sidebar} ${themeClasses.text}`}
    >
      {/* Logo/Header */}
      <div className={`p-6 border-b ${themeClasses.border}`}>
          <div className='flex items-center gap-3 mb-2'>
            <FloodGuardLogo size={40} className='shrink-0 rounded-lg' />
            <div>
              <h1 className={`text-lg font-bold ${themeClasses.text}`}>
                {t('sidebar.appName')}
              </h1>
              <p className={`text-xs ${themeClasses.textSecondary}`}>
                {t('sidebar.appSubtitle')}
              </p>
            </div>
        </div>
        {user && (
          <div className={`mt-3 pt-3 border-t ${themeClasses.border} flex items-center gap-3`}>
            <div
              className={`w-10 h-10 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-sm font-semibold ${
                theme === "light" ? "bg-indigo-100 text-indigo-600" : "bg-indigo-900/50 text-indigo-300"
              }`}
            >
              {(user as { avatar_url?: string }).avatar_url ? (
                <img
                  src={(user as { avatar_url?: string }).avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                getUserInitials(user)
              )}
            </div>
            <div className="min-w-0">
              <p className={`text-xs ${themeClasses.textSecondary}`}>{t('sidebar.loggedInAs')}</p>
              <p className={`text-sm font-medium ${themeClasses.text} truncate mt-0.5`}>
                {user.displayName || user.full_name || user.username || user.email}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu - Chưa đăng nhập: chỉ bản đồ. Đã đăng nhập: thêm báo cáo, xuất dữ liệu */}
      <nav className="flex-1 p-4 pt-6 space-y-2">
        <Link
          to="/"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass('/')}`}
        >
          <FaMapMarkedAlt size={20} />
          <span>{t('sidebar.map')}</span>
        </Link>

        {user && (
          <>
            <Link
              to={RISK_REPORT_PATH}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(RISK_REPORT_PATH)}`}
            >
              <IoIosPodium size={20} />
              <span>{t('sidebar.riskReport')}</span>
            </Link>
          </>
        )}

        {user && (
          <div className={`pt-4 mt-4 border-t ${themeClasses.border}`}>
            <Link
              to="/profile"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass('/profile')}`}
            >
              <IoMdPerson size={20} />
              <span>{t('sidebar.profile')}</span>
            </Link>
            <Link
              to={SETTINGS_PATH}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(SETTINGS_PATH)}`}
            >
              <IoMdSettings size={20} />
              <span>{t('sidebar.settings')}</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Footer - Login or Logout */}
      <div className={`p-4 border-t ${themeClasses.border}`}>
        {user ? (
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${themeClasses.text} ${theme === 'light' ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-red-900/30 hover:text-red-400'}`}
          >
            <FaSignOutAlt size={20} />
            <span>{t('sidebar.logout')}</span>
          </button>
        ) : (
          <Link
            to={LOGIN_PATH}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(LOGIN_PATH)}`}
          >
            <IoMdPerson size={20} />
            <span>{t('sidebar.login')}</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
