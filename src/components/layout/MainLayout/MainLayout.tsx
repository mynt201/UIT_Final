import { Outlet } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';
import AdminSidebar from '../AdminSidebar';

export default function MainLayout() {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className='w-full h-screen flex flex-col overflow-hidden'>
      <div className={`w-full flex flex-1 overflow-hidden min-h-0 ${themeClasses.background}`}>
        <AdminSidebar />
        <div className='flex-1 overflow-y-auto overflow-x-hidden min-w-0'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
