import { useState } from 'react';
import { IoMdClose } from 'react-icons/io';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [notifications, setNotifications] = useState(true);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('language', language);
    localStorage.setItem('notifications', notifications.toString());
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]'>
      <div className='bg-[#0a1628] rounded-xl shadow-2xl max-w-md w-full'>
        <div className='flex justify-between items-center p-6 border-b border-gray-700'>
          <h2 className='text-2xl font-bold text-white'>Cài đặt</h2>
          <button
            onClick={onClose}
            className='p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors'
          >
            <IoMdClose size={24} className='text-white' />
          </button>
        </div>

        <div className='p-6 space-y-6'>
          <div>
            <label className='block text-white mb-3'>Giao diện</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
              className='w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2'
            >
              <option value='dark'>Tối</option>
              <option value='light'>Sáng</option>
            </select>
          </div>

          <div>
            <label className='block text-white mb-3'>Ngôn ngữ</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'vi' | 'en')}
              className='w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2'
            >
              <option value='vi'>Tiếng Việt</option>
              <option value='en'>English</option>
            </select>
          </div>

          <div>
            <label className='flex items-center gap-3 text-white cursor-pointer'>
              <input
                type='checkbox'
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className='w-4 h-4'
              />
              <span>Bật thông báo</span>
            </label>
          </div>
        </div>

        <div className='p-6 border-t border-gray-700 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors'
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

