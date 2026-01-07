import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.jpg';
import { IoIosPerson } from 'react-icons/io';
import { IoMdLogOut, IoMdLogIn } from 'react-icons/io';
import { getCurrentUser, logout } from '../../Login/authService';
import type { User } from '../../../types';
import { LOGIN_PATH } from '../../../router/routePath';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';

export default function PageHeader() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  useEffect(() => {
    // Kiểm tra user mỗi khi component mount hoặc khi có thay đổi
    const checkUser = () => {
      setUser(getCurrentUser());
    };

    checkUser();

    // Kiểm tra định kỳ để cập nhật khi user đăng nhập/đăng xuất ở tab khác
    const interval = setInterval(checkUser, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  const handleLogin = () => {
    navigate(LOGIN_PATH);
  };

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const displayName = user?.username || user?.email || 'Khách';
  const isLoggedIn = !!user;

  return (
    <header
      className={`flex w-full border-b ${themeClasses.border} h-16 md:h-20 shrink-0 ${themeClasses.headerBg}`}
    >
      {/* Logo và Tên hệ thống */}
      <div className='flex items-center gap-3 md:gap-4 px-4 md:px-6 min-w-0'>
        <img src={logo} className='w-10 h-10 md:w-12 md:h-12 rounded-lg shrink-0' alt='Logo' />
        <div className='flex flex-col min-w-0'>
          <h1 className={`${themeClasses.text} text-base md:text-lg lg:text-xl font-bold truncate`}>
            Hệ thống Đánh giá Rủi ro Ngập lụt
          </h1>
          <p className={`${themeClasses.textSecondary} text-xs md:text-sm truncate`}>
            TP. Hồ Chí Minh
          </p>
        </div>
      </div>

      {/* User Info và Actions */}
      <div className='flex-1 flex items-center justify-end gap-3 md:gap-4 px-4 md:px-6'>
        {isLoggedIn ? (
          <>
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                theme === 'light' ? 'bg-gray-100' : 'bg-gray-800/50'
              }`}
            >
              <IoIosPerson
                size={18}
                className='shrink-0'
                color={theme === 'light' ? '#374151' : '#d1d5db'}
              />
              <div
                className={`${themeClasses.text} text-sm font-medium truncate max-w-[150px]`}
                title={displayName}
              >
                {displayName}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors ${
                theme === 'light'
                  ? 'hover:bg-gray-100 text-gray-700'
                  : 'hover:bg-gray-800/50 text-gray-300'
              }`}
              title='Đăng xuất'
            >
              <IoMdLogOut size={20} className='shrink-0' />
              <span className={`${themeClasses.text} text-sm hidden md:inline`}>Đăng xuất</span>
            </button>
          </>
        ) : (
          <>
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                theme === 'light' ? 'bg-gray-100' : 'bg-gray-800/50'
              }`}
            >
              <IoIosPerson
                size={18}
                className='shrink-0'
                color={theme === 'light' ? '#374151' : '#d1d5db'}
              />
              <div className={`${themeClasses.text} text-sm`}>Xin chào</div>
            </div>
            <button
              onClick={handleLogin}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors ${
                theme === 'light'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              <IoMdLogIn size={20} className='shrink-0' />
              <span className='text-sm hidden md:inline'>Đăng nhập</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
