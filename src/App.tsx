import './App.css';
import { ThemeProvider } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
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
    <ThemeProvider theme={theme}>
      {/* <CssBaseline /> */}
      <RouterProvider router={router} />;
    </ThemeProvider>
  );
}

export default App;
