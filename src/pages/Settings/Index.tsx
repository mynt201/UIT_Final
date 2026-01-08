import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";
import { Select, Button } from "../../components";
import type { Settings } from "../../types";

const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  language: "vi",
  notifications: true,
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  autoRefresh: false,
  refreshInterval: 30000,
  mapStyle: "default",
  defaultView: "map",
  autoSave: false,
  mapDefaultZoom: 13,
  mapAnimation: true,
  fontSize: "medium",
  dateFormat: "dd/mm/yyyy",
  showTooltips: true,
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return { ...DEFAULT_SETTINGS, ...parsed, theme };
      } catch (error) {
        console.error("Failed to parse settings:", error);
      }
    }
    return { ...DEFAULT_SETTINGS, theme };
  });
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Đồng bộ theme từ context
    setSettings((prev) => ({ ...prev, theme }));
  }, [theme]);

  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed, theme });
      } catch (error) {
        console.error("Failed to parse settings:", error);
      }
    }
  }, []);

  const applySettings = (newSettings: Settings) => {
    // Apply font size
    document.documentElement.setAttribute(
      "data-font-size",
      newSettings.fontSize,
    );

    // Save to localStorage
    localStorage.setItem("appSettings", JSON.stringify(newSettings));

    // Store individual settings for backward compatibility
    localStorage.setItem("language", newSettings.language);
    localStorage.setItem("notifications", newSettings.notifications.toString());
  };

  const handleSettingChange = <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Nếu thay đổi theme, cập nhật context
    if (key === "theme") {
      setTheme(value as "light" | "dark");
    }

    applySettings(newSettings);
    showSuccessMessage("Đã áp dụng cài đặt!");
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handleReset = () => {
    const resetSettings = DEFAULT_SETTINGS;
    setSettings(resetSettings);
    setTheme(resetSettings.theme);
    applySettings(resetSettings);
    showSuccessMessage("Đã khôi phục cài đặt mặc định!");
  };

  return (
    <div className="w-full h-full p-4 md:p-6 overflow-y-auto overflow-x-hidden theme-bg-primary theme-text-primary">
      <div className="text-2xl md:text-3xl font-bold mb-6 theme-text-primary">
        Cài đặt
      </div>

      {successMessage && (
        <div
          className={`mb-4 p-3 rounded ${
            theme === "light"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-green-900/30 border border-green-500 text-green-300"
          }`}
        >
          {successMessage}
        </div>
      )}

      <div className="space-y-6">
        {/* Giao diện */}
        <div
          className={`rounded-xl shadow-2xl p-6 ${
            theme === "light"
              ? "bg-gray-50 border border-gray-200"
              : "bg-[#0a1628]"
          }`}
        >
          <h3
            className={`text-xl font-semibold mb-4 border-b pb-2 ${
              theme === "light"
                ? "text-gray-900 border-gray-300"
                : "text-white border-gray-700"
            }`}
          >
            Giao diện
          </h3>
          <div className="space-y-4">
            <Select
              label="Chủ đề"
              options={[
                { value: "dark", label: "Tối" },
                { value: "light", label: "Sáng" },
              ]}
              value={settings.theme}
              onChange={(e) =>
                handleSettingChange("theme", e.target.value as "dark" | "light")
              }
            />

            <Select
              label="Cỡ chữ"
              options={[
                { value: "small", label: "Nhỏ" },
                { value: "medium", label: "Vừa" },
                { value: "large", label: "Lớn" },
              ]}
              value={settings.fontSize}
              onChange={(e) =>
                handleSettingChange(
                  "fontSize",
                  e.target.value as "small" | "medium" | "large",
                )
              }
            />
          </div>
        </div>

        {/* Ngôn ngữ & Định dạng */}
        <div
          className={`${themeClasses.backgroundSecondary} rounded-xl shadow-2xl p-6`}
        >
          <h3
            className={`${themeClasses.text} text-xl font-semibold mb-4 border-b ${themeClasses.border} pb-2`}
          >
            Ngôn ngữ & Định dạng
          </h3>
          <div className="space-y-4">
            <Select
              label="Ngôn ngữ"
              options={[
                { value: "vi", label: "Tiếng Việt" },
                { value: "en", label: "English" },
              ]}
              value={settings.language}
              onChange={(e) =>
                handleSettingChange("language", e.target.value as "vi" | "en")
              }
            />

            <Select
              label="Định dạng ngày"
              options={[
                { value: "dd/mm/yyyy", label: "dd/mm/yyyy" },
                { value: "mm/dd/yyyy", label: "mm/dd/yyyy" },
                { value: "yyyy-mm-dd", label: "yyyy-mm-dd" },
              ]}
              value={settings.dateFormat}
              onChange={(e) =>
                handleSettingChange(
                  "dateFormat",
                  e.target.value as "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd",
                )
              }
            />
          </div>
        </div>

        {/* Bản đồ */}
        <div
          className={`${themeClasses.backgroundSecondary} rounded-xl shadow-2xl p-6`}
        >
          <h3
            className={`${themeClasses.text} text-xl font-semibold mb-4 border-b ${themeClasses.border} pb-2`}
          >
            Cài đặt bản đồ
          </h3>
          <div className="space-y-4">
            <div>
              <label
                className={`block text-sm mb-2 ${themeClasses.textSecondary}`}
              >
                Mức zoom mặc định: {settings.mapDefaultZoom}
              </label>
              <input
                type="range"
                min="10"
                max="18"
                value={settings.mapDefaultZoom}
                onChange={(e) =>
                  handleSettingChange("mapDefaultZoom", Number(e.target.value))
                }
                className={`w-full h-2 ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-700"
                } rounded-lg appearance-none cursor-pointer`}
              />
              <div
                className={`flex justify-between text-xs mt-1 ${themeClasses.textSecondary}`}
              >
                <span>Gần</span>
                <span>Xa</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label
                  className={`block text-sm mb-1 ${themeClasses.textSecondary}`}
                >
                  Hiệu ứng chuyển động
                </label>
                <span className={`text-xs ${themeClasses.textSecondary}`}>
                  Bật hiệu ứng khi di chuyển bản đồ
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.mapAnimation}
                  onChange={(e) =>
                    handleSettingChange("mapAnimation", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div
                  className={`w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 ${
                    theme === "light"
                      ? "peer-focus:ring-indigo-800"
                      : "peer-focus:ring-indigo-600"
                  } rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    theme === "light"
                      ? "peer-checked:bg-indigo-600"
                      : "peer-checked:bg-indigo-500"
                  }`}
                ></div>
              </label>
            </div>
          </div>
        </div>

        {/* Thông báo & Tự động */}
        <div
          className={`${themeClasses.backgroundSecondary} rounded-xl shadow-2xl p-6`}
        >
          <h3
            className={`${themeClasses.text} text-xl font-semibold mb-4 border-b ${themeClasses.border} pb-2`}
          >
            Thông báo & Tự động
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label
                  className={`block text-sm mb-1 ${themeClasses.textSecondary}`}
                >
                  Bật thông báo
                </label>
                <span className={`text-xs ${themeClasses.textSecondary}`}>
                  Nhận thông báo về các cập nhật
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) =>
                    handleSettingChange("notifications", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div
                  className={`w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 ${
                    theme === "light"
                      ? "peer-focus:ring-indigo-800"
                      : "peer-focus:ring-indigo-600"
                  } rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    theme === "light"
                      ? "peer-checked:bg-indigo-600"
                      : "peer-checked:bg-indigo-500"
                  }`}
                ></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label
                  className={`block text-sm mb-1 ${themeClasses.textSecondary}`}
                >
                  Tự động lưu
                </label>
                <span className={`text-xs ${themeClasses.textSecondary}`}>
                  Tự động lưu thay đổi
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) =>
                    handleSettingChange("autoSave", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div
                  className={`w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 ${
                    theme === "light"
                      ? "peer-focus:ring-indigo-800"
                      : "peer-focus:ring-indigo-600"
                  } rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    theme === "light"
                      ? "peer-checked:bg-indigo-600"
                      : "peer-checked:bg-indigo-500"
                  }`}
                ></div>
              </label>
            </div>
          </div>
        </div>

        {/* Trải nghiệm người dùng */}
        <div
          className={`${themeClasses.backgroundSecondary} rounded-xl shadow-2xl p-6`}
        >
          <h3
            className={`${themeClasses.text} text-xl font-semibold mb-4 border-b ${themeClasses.border} pb-2`}
          >
            Trải nghiệm người dùng
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label
                  className={`block text-sm mb-1 ${themeClasses.textSecondary}`}
                >
                  Hiển thị tooltip
                </label>
                <span className={`text-xs ${themeClasses.textSecondary}`}>
                  Hiển thị gợi ý khi di chuột
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showTooltips}
                  onChange={(e) =>
                    handleSettingChange("showTooltips", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div
                  className={`w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 ${
                    theme === "light"
                      ? "peer-focus:ring-indigo-800"
                      : "peer-focus:ring-indigo-600"
                  } rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    theme === "light"
                      ? "peer-checked:bg-indigo-600"
                      : "peer-checked:bg-indigo-500"
                  }`}
                ></div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          className={`${themeClasses.backgroundSecondary} rounded-xl shadow-2xl p-6`}
        >
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={handleReset}>
              Khôi phục mặc định
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
