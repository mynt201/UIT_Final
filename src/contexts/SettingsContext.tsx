import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Settings } from "../types";

const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  language: "vi",
  dateFormat: "dd/mm/yyyy",
  mapStyle: "default",
  notifications: true,
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  autoRefresh: false,
  refreshInterval: 30000,
  defaultView: "map",
  fontSize: "medium",
  mapDefaultZoom: 13,
  mapAnimation: true,
  autoSave: false,
  showTooltips: true,
};

const STORAGE_KEY = "appSettings";

function loadFromStorage(): Settings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn("Failed to parse settings:", e);
  }
  return { ...DEFAULT_SETTINGS };
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  updateSettings: (partial: Partial<Settings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadFromStorage);

  const persist = useCallback((next: Settings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem("language", next.language);
    localStorage.setItem("notifications", String(next.notifications));
  }, []);

  const updateSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const updateSettings = useCallback(
    (partial: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    persist(DEFAULT_SETTINGS);
  }, [persist]);

  // Load from storage on mount (e.g. from another tab)
  useEffect(() => {
    const handler = () => setSettings(loadFromStorage());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Apply fontSize to document
  useEffect(() => {
    const sizeMap = { small: "14px", medium: "16px", large: "18px" } as const;
    document.documentElement.style.fontSize = sizeMap[settings.fontSize];
  }, [settings.fontSize]);

  return (
    <SettingsContext.Provider
      value={{ settings, updateSetting, updateSettings, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (ctx === undefined) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
