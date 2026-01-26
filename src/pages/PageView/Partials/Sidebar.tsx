import { IoIosListBox, IoIosPrint, IoIosPodium } from 'react-icons/io';
import { IoMdPerson, IoMdSettings } from 'react-icons/io';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';

export default function Sidebar() {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className={`w-[20%] flex flex-col border-r-2 ${themeClasses.border} p-5 ${themeClasses.sidebar} ${themeClasses.text}`}>
      <div className='flex-1'>
        <div className={`${themeClasses.text} h-12.5 flex gap-2 ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'} rounded-2xl px-4 items-center transition-colors`}>
          <IoIosListBox size={25} />
          <div>Đánh giá rủi ro ngập lụt</div>
        </div>
        <div className={`${themeClasses.text} h-12.5 flex gap-2 ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'} rounded-2xl px-4 items-center transition-colors`}>
          <IoIosPodium size={25} />
          <div>Báo cáo rủi ro</div>
        </div>
        <div className={`${themeClasses.text} h-12.5 flex gap-2 ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'} rounded-2xl px-4 items-center transition-colors`}>
          <IoIosPrint size={25} />
          <div>Báo cáo xuất dữ liệu</div>
        </div>
      </div>
      <div className={`border-t-2 ${themeClasses.border} flex-1 py-4`}>
        <div className={`${themeClasses.text} h-12.5 flex gap-2 ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'} rounded-2xl px-4 items-center transition-colors`}>
          <IoMdPerson size={25} />
          <div>Thông tin cá nhân</div>
        </div>
        <div className={`${themeClasses.text} h-12.5 flex gap-2 ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'} rounded-2xl px-4 items-center transition-colors`}>
          <IoMdSettings size={25} />
          <div>Cài đặt</div>
        </div>
      </div>
    </div>
  );
}
