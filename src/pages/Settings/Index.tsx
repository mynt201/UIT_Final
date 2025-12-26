import { useState, useEffect } from 'react';
import { IoMdCheckmark } from 'react-icons/io';

interface Settings {
  theme: 'dark' | 'light';
  language: 'vi' | 'en';
  notifications: boolean;
  autoSave: boolean;
  mapDefaultZoom: number;
  mapAnimation: boolean;
  fontSize: 'small' | 'medium' | 'large';
  dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  showTooltips: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  language: 'vi',
  notifications: true,
  autoSave: false,
  mapDefaultZoom: 13,
  mapAnimation: true,
  fontSize: 'medium',
  dateFormat: 'dd/mm/yyyy',
  showTooltips: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        applySettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to parse settings:', error);
      }
    } else {
      applySettings(DEFAULT_SETTINGS);
    }
  }, []);

  const applySettings = (newSettings: Settings) => {
    // Apply theme
    document.documentElement.setAttribute('data-theme', newSettings.theme);
    if (newSettings.theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }

    // Apply font size
    document.documentElement.setAttribute('data-font-size', newSettings.fontSize);

    // Save to localStorage
    localStorage.setItem('appSettings', JSON.stringify(newSettings));

    // Store individual settings for backward compatibility
    localStorage.setItem('theme', newSettings.theme);
    localStorage.setItem('language', newSettings.language);
    localStorage.setItem('notifications', newSettings.notifications.toString());
  };

  const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
    showSuccessMessage('Đã áp dụng cài đặt!');
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    applySettings(DEFAULT_SETTINGS);
    showSuccessMessage('Đã khôi phục cài đặt mặc định!');
  };

  return (
    <div className='w-[80%] p-6 h-full overflow-y-auto'>
      <div className='text-white text-3xl font-bold mb-6'>Cài đặt</div>

      {successMessage && (
        <div className='mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded'>
          {successMessage}
        </div>
      )}

      <div className='space-y-6'>
        {/* Giao diện */}
        <div className='bg-[#0a1628] rounded-xl shadow-2xl p-6'>
          <h3 className='text-white text-xl font-semibold mb-4 border-b border-gray-700 pb-2'>
            Giao diện
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-gray-400 text-sm mb-2'>Chủ đề</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value as 'dark' | 'light')}
                className='w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='dark'>Tối</option>
                <option value='light'>Sáng</option>
              </select>
            </div>

            <div>
              <label className='block text-gray-400 text-sm mb-2'>Cỡ chữ</label>
              <select
                value={settings.fontSize}
                onChange={(e) =>
                  handleSettingChange('fontSize', e.target.value as 'small' | 'medium' | 'large')
                }
                className='w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='small'>Nhỏ</option>
                <option value='medium'>Vừa</option>
                <option value='large'>Lớn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ngôn ngữ & Định dạng */}
        <div className='bg-[#0a1628] rounded-xl shadow-2xl p-6'>
          <h3 className='text-white text-xl font-semibold mb-4 border-b border-gray-700 pb-2'>
            Ngôn ngữ & Định dạng
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-gray-400 text-sm mb-2'>Ngôn ngữ</label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value as 'vi' | 'en')}
                className='w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='vi'>Tiếng Việt</option>
                <option value='en'>English</option>
              </select>
            </div>

            <div>
              <label className='block text-gray-400 text-sm mb-2'>Định dạng ngày</label>
              <select
                value={settings.dateFormat}
                onChange={(e) =>
                  handleSettingChange(
                    'dateFormat',
                    e.target.value as 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd'
                  )
                }
                className='w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='dd/mm/yyyy'>dd/mm/yyyy</option>
                <option value='mm/dd/yyyy'>mm/dd/yyyy</option>
                <option value='yyyy-mm-dd'>yyyy-mm-dd</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bản đồ */}
        <div className='bg-[#0a1628] rounded-xl shadow-2xl p-6'>
          <h3 className='text-white text-xl font-semibold mb-4 border-b border-gray-700 pb-2'>
            Cài đặt bản đồ
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-gray-400 text-sm mb-2'>
                Mức zoom mặc định: {settings.mapDefaultZoom}
              </label>
              <input
                type='range'
                min='10'
                max='18'
                value={settings.mapDefaultZoom}
                onChange={(e) => handleSettingChange('mapDefaultZoom', Number(e.target.value))}
                className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer'
              />
              <div className='flex justify-between text-xs text-gray-500 mt-1'>
                <span>Gần</span>
                <span>Xa</span>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <label className='block text-gray-400 text-sm mb-1'>Hiệu ứng chuyển động</label>
                <span className='text-gray-500 text-xs'>Bật hiệu ứng khi di chuyển bản đồ</span>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.mapAnimation}
                  onChange={(e) => handleSettingChange('mapAnimation', e.target.checked)}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Thông báo & Tự động */}
        <div className='bg-[#0a1628] rounded-xl shadow-2xl p-6'>
          <h3 className='text-white text-xl font-semibold mb-4 border-b border-gray-700 pb-2'>
            Thông báo & Tự động
          </h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <label className='block text-gray-400 text-sm mb-1'>Bật thông báo</label>
                <span className='text-gray-500 text-xs'>Nhận thông báo về các cập nhật</span>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <label className='block text-gray-400 text-sm mb-1'>Tự động lưu</label>
                <span className='text-gray-500 text-xs'>Tự động lưu thay đổi</span>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Trải nghiệm người dùng */}
        <div className='bg-[#0a1628] rounded-xl shadow-2xl p-6'>
          <h3 className='text-white text-xl font-semibold mb-4 border-b border-gray-700 pb-2'>
            Trải nghiệm người dùng
          </h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <label className='block text-gray-400 text-sm mb-1'>Hiển thị tooltip</label>
                <span className='text-gray-500 text-xs'>Hiển thị gợi ý khi di chuột</span>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.showTooltips}
                  onChange={(e) => handleSettingChange('showTooltips', e.target.checked)}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='bg-[#0a1628] rounded-xl shadow-2xl p-6'>
          <div className='flex justify-end gap-3'>
            <button
              onClick={handleReset}
              className='px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors'
            >
              Khôi phục mặc định
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

