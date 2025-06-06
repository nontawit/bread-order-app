// src/App.tsx

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Fab,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  CssBaseline,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import AddEditOrderForm from './components/AddEditOrderForm';
import { Order, OrderStatus, PageType } from './types/order';
import { addOrder, updateOrder } from './utils/firebaseHelpers';

// สร้าง Material-UI Theme ของคุณ
const theme = createTheme({
  typography: {
    fontFamily: 'Kanit, sans-serif',
  },
  palette: {
    primary: {
      main: '#192a56', // Dark blue for AppBar background
      light: '#34495e',
    },
    secondary: {
      main: '#FF9800', // สีส้ม (ใช้สำหรับ Fab)
    },
    error: {
      main: '#f44336',
    },
    success: {
      main: '#4caf50',
    },
    info: {
      main: '#2196f3',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-selected': {
            color: '#ffffff',
            '& .MuiTab-iconWrapper': {
              fontSize: '1.6rem', // ขนาดไอคอนใหญ่ขึ้นเมื่อเลือก
            },
            fontSize: '0.85rem', // ขนาดตัวอักษรของ label ถ้ามี
          },
          '& .MuiTab-iconWrapper': {
              fontSize: '1.4rem', // ขนาดไอคอนปกติ
          },
        },
      },
    },
    MuiToolbar: {
        styleOverrides: {
            root: {
                minHeight: '40px', // *** ลด minHeight ของ Toolbar ลงอีกสำหรับ Mobile ***
                '@media (min-width: 600px)': {
                    minHeight: '48px', // *** ลด minHeight สำหรับ Desktop/Tablet ***
                },
            },
        },
    },
  }
});

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const handleOpenForm = (orderToEdit?: Order) => {
    setEditingOrder(orderToEdit);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingOrder(undefined);
  };

  const handleAddEditOrderSubmit = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    console.log("App.tsx: handleAddEditOrderSubmit called with orderData:", orderData);
    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id!, {
          ...orderData,
          status: editingOrder.status,
          createdAt: editingOrder.createdAt,
        });
        console.log("App.tsx: Update order operation initiated.");
      } else {
        await addOrder({
          ...orderData,
          status: 'รอคิว' as OrderStatus,
          createdAt: Date.now(),
        });
        console.log("App.tsx: Add new order operation initiated.");
      }
      handleCloseForm();
    } catch (err) {
      console.error("App.tsx Error: Failed to save order.", err);
      alert("เกิดข้อผิดพลาดในการบันทึกออเดอร์ กรุณาตรวจสอบ Console");
    }
  };

  const handlePageChange = (_: React.SyntheticEvent, newValue: PageType) => {
    setCurrentPage(newValue);
  };

  const handleGoHome = () => {
    setCurrentPage('home');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
        <AppBar
          position="fixed"
          color="primary"
          elevation={3}
          sx={{
            background: theme.palette.primary.main,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Toolbar
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: { xs: 0.25, sm: 0.5 }, // *** ลด paddingY ลงอีก ***
            }}
          >
            {/* ไอคอน Home - ชิดซ้ายสุด */}
            <IconButton
              aria-label="home"
              onClick={handleGoHome}
              sx={{
                mr: { xs: 0.5, sm: 1 }, // *** ลด margin-right ลงอีก ***
                color: currentPage === 'home' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                '& .MuiSvgIcon-root': {
                    fontSize: currentPage === 'home' ? '1.7rem' : '1.4rem', // *** ลดขนาดไอคอน Home ลงอีก ***
                    transition: 'font-size 0.2s ease-in-out',
                }
              }}
            >
              <HomeIcon />
            </IconButton>

            {/* Group สำหรับ Tabs และ Fab - ชิดขวา */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 1 }, // *** ลดระยะห่างระหว่าง Tabs กับ Fab ลงอีก ***
                ml: 'auto',
              }}
            >
              <Tabs
                value={currentPage}
                onChange={handlePageChange}
                sx={{
                  minHeight: 'auto',
                  '.MuiTabs-indicator': {
                    height: 0,
                    display: 'none',
                  },
                  '.MuiTab-root': {
                    fontWeight: 600,
                    fontSize: { xs: '0.65rem', sm: '0.8rem' }, // *** ลดขนาดตัวอักษร Tab ลงอีก ***
                    px: { xs: 0.5, sm: 1 }, // *** ลด padding แนวนอน Tab ลงอีก ***
                    py: { xs: 0.5, sm: 0.75 }, // *** ลด paddingY Tab ลงอีก ***
                    transition: 'all 0.2s ease-in-out',
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-selected': {
                      color: '#ffffff',
                      '& .MuiTab-iconWrapper': {
                        fontSize: '1.5rem', // *** ลดขนาดไอคอน Tab ที่เลือกอีก ***
                      },
                      fontSize: '0.75rem', // *** ลดขนาดตัวอักษร Tab ที่เลือกอีก ***
                    },
                    '& .MuiTab-iconWrapper': {
                        fontSize: '1.3rem', // *** ลดขนาดไอคอน Tab ปกติอีก ***
                    },
                  },
                }}
              >
                <Tab icon={<HistoryIcon />} label="ประวัติ" value="history" aria-label="ประวัติ" />
              </Tabs>

              {/* ปุ่มเพิ่มออเดอร์ (Fab) */}
              <Fab
                color="secondary"
                aria-label="add order"
                onClick={() => handleOpenForm()}
                size="small"
                sx={{
                  height: 36, // *** ลด height/width ของ Fab ลงอีก ***
                  width: 36,
                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                  flexShrink: 0,
                }}
              >
                <AddIcon sx={{ fontSize: '1.4rem' }} /> {/* *** ลดขนาดไอคอน Add ลงอีก *** */}
              </Fab>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Toolbar เปล่าๆ สำหรับชดเชยพื้นที่ของ AppBar ที่เป็น fixed */}
        {/* minHeight ควรตรงกับ minHeight ของ Toolbar ที่กำหนดใน theme.components.MuiToolbar */}
        <Toolbar sx={{ minHeight: { xs: '40px', sm: '48px' } }} />

        {/* ส่วนชื่อแอปในเนื้อหา */}
        <Container component="main" sx={{ flexGrow: 1, py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 }, bgcolor: theme.palette.background.default }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mt: { xs: 2, sm: 3 }, // *** เพิ่ม marginTop เพื่อให้ห่างจาก App Bar ***
              mb: { xs: 2, sm: 3 },
              textAlign: 'center',
            }}
          >
            ระบบจัดการออเดอร์ขนมปัง
          </Typography>

          {/* เนื้อหาหน้าหลัก/ประวัติ */}
          {currentPage === 'home' && <HomePage onEditOrder={handleOpenForm} />}
          {currentPage === 'history' && <HistoryPage onEditOrder={handleOpenForm} />}
        </Container>

        <Dialog
          open={isFormOpen}
          onClose={handleCloseForm}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ textAlign: 'center', py: { xs: 2, sm: 3 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {editingOrder ? 'แก้ไขออเดอร์' : 'เพิ่มออเดอร์ใหม่'}
            {isMobile && (
              <IconButton
                aria-label="close"
                onClick={handleCloseForm}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (muiTheme) => muiTheme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
            <AddEditOrderForm
              initialOrder={editingOrder}
              onSubmit={handleAddEditOrderSubmit}
              onCancel={handleCloseForm}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;