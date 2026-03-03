import { createContext, useContext, useLayoutEffect, type ReactNode } from 'react';
import { useSettings } from './SettingsContext';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings, updateSetting } = useSettings();
  const theme = (settings.theme || 'dark') as Theme;

  // useLayoutEffect: áp dụng theme trước khi browser vẽ, tránh nháy sáng/đen
  useLayoutEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove('dark', 'light');
    body.classList.remove('dark-theme', 'light-theme');
    if (theme === 'light') {
      root.classList.add('light');
      body.classList.add('light-theme');
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#000000';
    } else {
      root.classList.add('dark');
      body.classList.add('dark-theme');
      body.style.backgroundColor = '#000000';
      body.style.color = '#ffffff';
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    updateSetting('theme', newTheme);
  };

  const toggleTheme = () => {
    updateSetting('theme', theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

