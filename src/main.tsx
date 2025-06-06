// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { blue, pink } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: blue[500],
    },
    secondary: {
      main: pink[400],
    },
    background: {
      default: '#f5f5f5', // สีพื้นหลัง
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    // เพิ่ม font อื่นๆ ถ้าต้องการ
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none', // ไม่บังคับเป็นตัวพิมพ์ใหญ่
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // ไม่บังคับเป็นตัวพิมพ์ใหญ่
        },
      },
    },
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);