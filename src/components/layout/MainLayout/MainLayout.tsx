import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import PageHeader from '../../../pages/PageView/Partials/PageHeader';
import Sidebar from '../../../pages/PageView/Partials/Sidebar';
import ExportDataModal from '../../../pages/PageView/Partials/ExportDataModal';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';

export default function MainLayout() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <div className='w-full h-screen flex flex-col overflow-hidden'>
      <PageHeader />
      <div className={`w-full flex flex-1 overflow-hidden min-h-0 ${themeClasses.background}`}>
        <Sidebar onExportClick={() => setIsExportModalOpen(true)} />
        <div className='flex-1 overflow-y-auto overflow-x-hidden min-w-0'>
          <Outlet />
        </div>
      </div>
      <ExportDataModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
    </div>
  );
}

