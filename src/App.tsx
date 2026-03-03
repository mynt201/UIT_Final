import './App.css';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useSettingsLanguageSync } from './hooks/useSettingsLanguageSync';
import { Toaster } from 'react-hot-toast';

function SettingsLanguageSync() {
  useSettingsLanguageSync();
  return null;
}

// theme.js
import { createTheme } from '@mui/material/styles';

const muiTheme = createTheme({
  palette: {
    background: {
      default: '#f3f4f6',
      paper: '#ffffff',
    },
    divider: '#d1d5db', // ← đổi màu line ở đây
  },
});

function App() {
  return (
    <SettingsProvider>
    <ThemeProvider>
      <SettingsLanguageSync />
      <MuiThemeProvider theme={muiTheme}>
        {/* <CssBaseline /> */}
        <RouterProvider router={router} />
            <Toaster
              position='top-right'
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
      </MuiThemeProvider>
    </ThemeProvider>
    </SettingsProvider>
  );
}

export default App;
