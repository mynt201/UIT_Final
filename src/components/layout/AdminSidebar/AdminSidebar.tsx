import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaChartBar,
  FaChartLine,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaMapMarkedAlt,
  FaTable,
} from 'react-icons/fa';
import { IoMdPerson } from 'react-icons/io';
import { useAuth } from '../../../contexts/AuthContext';
import FloodGuardLogo from '../../../assets/FloodGuardLogo';
import {
  ADMIN_PATH,
  HOME_PATH,
  ADMIN_DATA_MANAGEMENT_PATH,
  ADMIN_INDICATOR_MANAGEMENT_PATH,
  ADMIN_USER_MANAGEMENT_PATH,
  ADMIN_PAGE_VIEW_PATH,
  ADMIN_RISK_REPORT_PATH,
  ADMIN_RISK_ASSESSMENT_MANAGEMENT_PATH,
  ADMIN_USER_PROFILE_PATH,
  ADMIN_SETTINGS_PATH,
} from '../../../router/routePath';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { getThemeClasses } from '../../../utils/themeUtils';

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const themeClasses = getThemeClasses(theme);

  const isActive = (path: string) => {
    if (path === ADMIN_PATH) {
      return location.pathname === ADMIN_PATH;
    }
    return location.pathname.startsWith(path);
  };

  const getActiveClass = (path: string) => {
    return isActive(path)
      ? theme === 'light'
        ? 'bg-indigo-600 text-white font-medium'
        : 'bg-indigo-600 text-white font-medium'
      : `${themeClasses.text} ${theme === 'light' ? 'hover:bg-gray-100 hover:text-gray-900' : 'hover:bg-gray-800 hover:text-white'
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
            <h1 className={`text-lg font-bold ${themeClasses.text}`}>{t('sidebar.appName')}</h1>
            <p className={`text-xs ${themeClasses.textSecondary}`}>{t('sidebar.appSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className='flex-1 p-4 space-y-2'>
        <Link
          to={ADMIN_PAGE_VIEW_PATH}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
            ADMIN_PAGE_VIEW_PATH
          )}`}
        >
          <FaMapMarkedAlt size={20} />
          <span>{t('sidebar.map')}</span>
        </Link>

        <Link
          to={ADMIN_RISK_REPORT_PATH}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
            ADMIN_RISK_REPORT_PATH
          )}`}
        >
          <FaChartBar size={20} />
          <span>{t('sidebar.riskReport')}</span>
        </Link>

        <div className={`pt-4 mt-4 border-t ${themeClasses.border}`}>
          <div
            className={`px-4 py-2 text-xs uppercase tracking-wider ${themeClasses.textSecondary}`}
          >
            {t('sidebar.management')}
          </div>

          <Link
            to={ADMIN_DATA_MANAGEMENT_PATH}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
              ADMIN_DATA_MANAGEMENT_PATH
            )}`}
          >
            <FaMapMarkedAlt size={20} />
            <span>{t('sidebar.wardManagement')}</span>
          </Link>

          <Link
            to={ADMIN_INDICATOR_MANAGEMENT_PATH}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
              ADMIN_INDICATOR_MANAGEMENT_PATH
            )}`}
          >
            <FaChartLine size={20} />
            <span>{t('sidebar.indicatorManagement')}</span>
          </Link>

          <Link
            to={ADMIN_RISK_ASSESSMENT_MANAGEMENT_PATH}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
              ADMIN_RISK_ASSESSMENT_MANAGEMENT_PATH
            )}`}
          >
            <FaTable size={20} />
            <span>{t('sidebar.riskAssessmentManagement')}</span>
          </Link>

          <Link
            to={ADMIN_USER_MANAGEMENT_PATH}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
              ADMIN_USER_MANAGEMENT_PATH
            )}`}
          >
            <FaUsers size={20} />
            <span>{t('sidebar.userManagement')}</span>
          </Link>

          <Link
            to={ADMIN_SETTINGS_PATH}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
              ADMIN_SETTINGS_PATH
            )}`}
          >
            <FaCog size={20} />
            <span>{t('sidebar.settings')}</span>
          </Link>
        </div>

        {/* User Options Section */}
        <div className={`pt-4 mt-4 border-t ${themeClasses.border}`}>
          <Link
            to={ADMIN_USER_PROFILE_PATH}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass(
              ADMIN_USER_PROFILE_PATH
            )}`}
          >
            <IoMdPerson size={20} />
            <span>{t('sidebar.profile')}</span>
          </Link>
        </div>
      </nav>

      {/* Footer/Logout */}
      <div className={`p-4 border-t ${themeClasses.border}`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${themeClasses.text
            } ${theme === 'light'
              ? 'hover:bg-red-50 hover:text-red-600'
              : 'hover:bg-red-900/30 hover:text-red-400'
            }`}
        >
          <FaSignOutAlt size={20} />
          <span>{t('sidebar.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
