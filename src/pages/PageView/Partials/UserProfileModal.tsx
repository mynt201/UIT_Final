import { useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { getCurrentUser, type User } from '../../Login/authService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUser(getCurrentUser());
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-10000'>
      <div className='bg-[#0a1628] rounded-xl shadow-2xl max-w-md w-full'>
        <div className='flex justify-between items-center p-6 border-b border-gray-700'>
          <h2 className='text-2xl font-bold text-white'>Thông tin cá nhân</h2>
          <button
            onClick={onClose}
            className='p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors'
          >
            <IoMdClose size={24} className='text-white' />
          </button>
        </div>

        <div className='p-6 space-y-4'>
          <div>
            <label className='block text-gray-400 text-sm mb-1'>ID</label>
            <div className='text-white'>{user.id}</div>
          </div>

          <div>
            <label className='block text-gray-400 text-sm mb-1'>Tên người dùng</label>
            <div className='text-white'>{user.username}</div>
          </div>

          <div>
            <label className='block text-gray-400 text-sm mb-1'>Email</label>
            <div className='text-white'>{user.email}</div>
          </div>

          <div>
            <label className='block text-gray-400 text-sm mb-1'>Vai trò</label>
            <div className='text-white'>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  user.role === 'admin'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-green-500/20 text-green-400'
                }`}
              >
                {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
              </span>
            </div>
          </div>
        </div>

        <div className='p-6 border-t border-gray-700 flex justify-end'>
          <button
            onClick={onClose}
            className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
