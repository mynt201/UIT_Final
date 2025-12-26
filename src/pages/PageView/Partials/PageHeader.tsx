import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.jpg';
import { IoIosMap, IoIosPerson } from 'react-icons/io';
import { IoMdLogOut } from 'react-icons/io';
import { getCurrentUser, logout } from '../../Login/authService';
import type { User } from '../../Login/authService';

interface PageHeaderProps {
  onSearch?: (searchTerm: string) => void;
}

export default function PageHeader({ onSearch }: PageHeaderProps) {
  const navigate = useNavigate();
  const [user] = useState<User | null>(() => getCurrentUser());
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const displayName = user?.username || user?.email || 'Khách';

  return (
    <header className='flex w-full bg-black border-b-2 border-b-gray-700 h-20'>
      <div className='w-[20%] flex justify-center items-center gap-9'>
        <div className='text-white text-4xl'>Bản đồ</div>
        <img src={logo} className='w-12.5 h-12.5 rounded-2xl' alt='Logo' />
      </div>
      <div className='w-[50%] h-full flex items-center'>
        <form onSubmit={handleSearchSubmit} className='w-full'>
          <div className='w-full flex bg-neutral-500 rounded-2xl'>
            <div className='w-12.5 flex justify-center items-center'>
              <IoIosMap color='white' size={25} />
            </div>
            <input
              type='text'
              placeholder='Tìm kiếm....'
              value={searchTerm}
              onChange={handleSearchChange}
              className='w-[calc(100%-20px)] bg-neutral-500 h-10 rounded-2xl outline-0 text-white placeholder-gray-400'
            />
          </div>
        </form>
      </div>
      <div className='w-[30%] h-full flex justify-center items-center'>
        <div className='flex gap-5'>
          <div className='flex items-end gap-2'>
            <IoIosPerson size={25} color='white' />
            <div className='text-white flex items-end'>Xin chào, {displayName}</div>
          </div>
          <button
            onClick={handleLogout}
            className='flex items-end gap-2 hover:opacity-70 transition-opacity cursor-pointer'
          >
            <IoMdLogOut color='white' size={25} />
            <div className='text-white'>Đăng xuất</div>
          </button>
        </div>
      </div>
    </header>
  );
}
