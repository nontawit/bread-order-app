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
      default: '#f5f5f5',
    },
  },
  typography: {
    // กำหนด fontFamily สำหรับ Roboto และ Prompt (หรือฟอนต์ไทยอื่นๆ)
    // ตรวจสอบให้แน่ใจว่าได้ import ฟอนต์เหล่านี้ใน index.css หรือ public/index.html แล้ว
    fontFamily: [
      'Kanit', // ฟอนต์ไทยที่คุณต้องการใช้
      'Roboto',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    // สามารถเพิ่ม overrides สำหรับ Typography ที่เจาะจงได้ถ้าต้องการ
    // MuiTypography: {
    //   styleOverrides: {
    //     root: {
    //       // ปรับ styling เพิ่มเติมที่นี่
    //     },
    //   },
    // },
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