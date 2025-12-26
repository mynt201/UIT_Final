import './App.css';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ThemeProvider } from './contexts/ThemeContext';

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
    <ThemeProvider>
      <MuiThemeProvider theme={muiTheme}>
        {/* <CssBaseline /> */}
        <RouterProvider router={router} />
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

export default App;
