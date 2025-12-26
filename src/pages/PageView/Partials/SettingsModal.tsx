import { useState } from 'react';
import { Modal, Select, Button } from '../../../components';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme: currentTheme, setTheme: setCurrentTheme } = useTheme();
  const themeClasses = getThemeClasses(currentTheme);
  const [theme, setTheme] = useState<'dark' | 'light'>(currentTheme);
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
    localStorage.setItem('language', language);
    localStorage.setItem('notifications', notifications.toString());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cài đặt"
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Lưu
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <Select
          label="Giao diện"
          options={[
            { value: 'dark', label: 'Tối' },
            { value: 'light', label: 'Sáng' },
          ]}
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
        />

        <Select
          label="Ngôn ngữ"
          options={[
            { value: 'vi', label: 'Tiếng Việt' },
            { value: 'en', label: 'English' },
          ]}
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'vi' | 'en')}
        />

        <div>
          <label className={`flex items-center gap-3 cursor-pointer ${themeClasses.text}`}>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Bật thông báo</span>
          </label>
        </div>
      </div>
    </Modal>
  );
}

