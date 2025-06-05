// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css'; // ตรวจสอบว่ามีไฟล์ CSS สำหรับ reset styles หรือ global styles
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // สำหรับการ reset CSS default

// สร้าง Material-UI Theme ที่กำหนดเอง
let theme = createTheme({
  palette: {
    primary: {
      main: '#42a5f5', // สีฟ้าสดใส
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#ab47bc', // สีม่วง
      light: '#ce93d8',
      dark: '#7b1fa2',
    },
    error: {
      main: '#ef5350',
    },
    warning: {
      main: '#ffb300',
    },
    info: {
      main: '#29b6f6',
    },
    success: {
      main: '#66bb6a',
    },
    background: {
      default: '#f4f6f8', // สีพื้นหลังที่ดูสะอาดตา
      paper: '#ffffff', // สีพื้นหลังของ Card, Dialog
    },
  },
  typography: {
    fontFamily: ['"Kanit"', 'sans-serif'].join(','), // ตัวอย่างการใช้ฟอนต์ Kanit (ต้อง import ใน index.css/html)
    h4: {
      fontWeight: 600,
      fontSize: '2rem',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.75rem',
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
      '@media (min-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    body1: {
      fontSize: '1rem',
      '@media (min-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    button: {
      textTransform: 'none', // ไม่ต้องบังคับให้เป็นตัวพิมพ์ใหญ่
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true, // ลบเงาเริ่มต้นของปุ่ม
      },
      styleOverrides: {
        root: {
          borderRadius: 8, // ทำให้ปุ่มโค้งมนขึ้น
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined', // กำหนด TextField เป็น outlined โดย default
      },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 12, // ทำให้ Card โค้งมนขึ้น
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', // เงาที่ดูเบาลง
            }
        }
    },
    MuiDialog: {
        styleOverrides: {
            paper: {
                borderRadius: 12, // ทำให้ Dialog โค้งมนขึ้น
            }
        }
    }
  },
});

// ทำให้ Font Sizes ปรับตามหน้าจออัตโนมัติ
theme = responsiveFontSizes(theme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* ใช้ CssBaseline เพื่อให้ CSS เป็นค่าเริ่มต้นที่สอดคล้องกัน */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);