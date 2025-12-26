import { Link, useLocation } from 'react-router-dom';
import { IoIosListBox, IoIosPrint, IoIosPodium } from 'react-icons/io';
import { IoMdPerson, IoMdSettings } from 'react-icons/io';

interface SidebarProps {
  onExportClick?: () => void;
}

export default function Sidebar({ onExportClick }: SidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getActiveClass = (path: string) => {
    return isActive(path) ? 'bg-blue-600' : 'hover:bg-neutral-500';
  };

  const handleExportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onExportClick) {
      onExportClick();
    }
  };

  return (
    <div className='w-[20%] flex flex-col border-r-2 border-r-gray-700 p-5'>
      <div className='flex-1'>
        <Link
          to='/'
          className={`w-full text-white h-12.5 flex gap-2 rounded-2xl px-4 items-center transition-colors ${getActiveClass(
            '/'
          )}`}
        >
          <IoIosListBox color='white' size={25} />
          <div>Đánh giá rủi ro ngập lụt</div>
        </Link>
        <Link
          to='/risk-report'
          className={`w-full text-white h-12.5 flex gap-2 rounded-2xl px-4 items-center transition-colors mt-2 ${getActiveClass(
            '/risk-report'
          )}`}
        >
          <IoIosPodium color='white' size={25} />
          <div>Báo cáo rủi ro</div>
        </Link>
        <button
          onClick={handleExportClick}
          className='w-full text-white h-12.5 flex gap-2 rounded-2xl px-4 items-center transition-colors mt-2 hover:bg-neutral-500'
        >
          <IoIosPrint color='white' size={25} />
          <div>Báo cáo xuất dữ liệu</div>
        </button>
      </div>
      <div className='border-t-2 border-t-gray-700 flex-1 py-4'>
        <Link
          to='/profile'
          className={`w-full text-white h-12.5 flex gap-2 rounded-2xl px-4 items-center transition-colors ${getActiveClass(
            '/profile'
          )}`}
        >
          <IoMdPerson color='white' size={25} />
          <div>Thông tin cá nhân</div>
        </Link>
        <Link
          to='/settings'
          className={`w-full text-white h-12.5 flex gap-2 rounded-2xl px-4 items-center transition-colors mt-2 ${getActiveClass(
            '/settings'
          )}`}
        >
          <IoMdSettings color='white' size={25} />
          <div>Cài đặt</div>
        </Link>
      </div>
    </div>
  );
}
