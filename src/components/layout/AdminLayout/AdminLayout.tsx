import { Outlet, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import AdminHeader from '../AdminHeader/AdminHeader';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { getThemeClasses } from '../../../utils/themeUtils';

/** Các query key phụ thuộc dữ liệu chỉ số/bản đồ/báo cáo — xóa khi chuyển trang để trang mới gọi API mới. */
const DEPENDENT_QUERY_KEYS = [
  'indicator-values',
  'indicator-values-years',
  'risk-assessments',
  'map-wards',
  'report-dashboard',
  'report-compare',
] as const;

const AdminLayout = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const themeClasses = getThemeClasses(theme);
  const location = useLocation();
  const queryClient = useQueryClient();
  const prevPathRef = useRef(location.pathname);

  // Khi click sidebar chuyển trang: xóa cache các API phụ thuộc để trang đích gọi API mới
  useEffect(() => {
    if (prevPathRef.current === location.pathname) return;
    prevPathRef.current = location.pathname;
    DEPENDENT_QUERY_KEYS.forEach((key) => {
      queryClient.removeQueries({ queryKey: [key] });
    });
  }, [location.pathname, queryClient]);

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
