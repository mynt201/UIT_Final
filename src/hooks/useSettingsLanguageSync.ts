import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { settingsService } from '../services/settingsService';
import i18n from '../i18n';

/**
 * 1) Đồng bộ settings.language → i18n mọi lúc (đổi trong Cài đặt hoặc load từ API).
 * 2) Khi user đăng nhập: gọi API lấy settings, cập nhật language vào context (i18n sẽ sync qua effect 1).
 */
export function useSettingsLanguageSync() {
  const { user } = useAuth();
  const { settings, updateSetting } = useSettings();

  // Luôn giữ i18n trùng với settings.language để mọi trang (PageView, ...) dùng đúng ngôn ngữ
  useEffect(() => {
    const lang = settings.language === 'en' ? 'en' : 'vi';
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [settings.language]);

  // Khi đăng nhập: load settings từ API và cập nhật context
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    settingsService.getSettings().then((apiSettings) => {
      if (cancelled || !apiSettings?.language) return;
      const lang = apiSettings.language === 'en' ? 'en' : 'vi';
      if (settings.language !== lang) {
        updateSetting('language', lang as 'vi' | 'en');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);
}
