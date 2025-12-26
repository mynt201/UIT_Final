import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import PageHeader from '../../pages/PageView/Partials/PageHeader';
import Sidebar from '../../pages/PageView/Partials/Sidebar';
import ExportDataModal from '../../pages/PageView/Partials/ExportDataModal';

export default function MainLayout() {
  const navigate = useNavigate();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className='w-full'>
      <PageHeader onSearch={handleSearch} />
      <div className='w-full flex bg-black h-[calc(100vh-80px)]'>
        <Sidebar onExportClick={() => setIsExportModalOpen(true)} />
        <Outlet />
      </div>
      <ExportDataModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
    </div>
  );
}

