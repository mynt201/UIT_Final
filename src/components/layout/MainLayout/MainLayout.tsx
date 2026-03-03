import { Outlet } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { getThemeClasses } from '../../../utils/themeUtils';
import AdminSidebar from '../AdminSidebar';

export default function MainLayout() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className='w-full h-screen flex flex-col overflow-hidden'>
      <div className={`w-full flex flex-1 overflow-hidden min-h-0 ${themeClasses.background}`}>
        <AdminSidebar />
        <div className='flex-1 flex flex-col overflow-hidden min-w-0'>
          <div className='flex-1 overflow-y-auto overflow-x-hidden'>
            <Outlet />
          </div>
          <footer
            className={`shrink-0 px-4 py-2 text-center text-xs border-t ${themeClasses.border} ${themeClasses.textSecondary}`}
          >
            © {new Date().getFullYear()} FloodGuard. {t('footer.copyright')}
          </footer>
        </div>
      </div>
    </div>
  );
}
