import { Outlet } from 'react-router-dom';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import AdminHeader from '../AdminHeader/AdminHeader';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { getThemeClasses } from '../../../utils/themeUtils';

const AdminLayout = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className={`flex h-screen overflow-hidden ${themeClasses.background}`}>
      <AdminSidebar />
      <div className='flex-1 flex flex-col overflow-hidden min-w-0'>
        <AdminHeader />
        <main className='flex-1 overflow-y-auto overflow-x-hidden'>
          <Outlet />
        </main>
        <footer
          className={`shrink-0 px-4 py-2 text-center text-xs border-t ${themeClasses.border} ${themeClasses.textSecondary}`}
        >
          © {new Date().getFullYear()} FloodGuard. {t('footer.copyright')}
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
