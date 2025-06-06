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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import AddEditOrderForm from './components/AddEditOrderForm';
import { Order, OrderStatus, PageType } from './types/order';
import { addOrder, updateOrder } from './utils/firebaseHelpers';

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const handlePageChange = (event: React.SyntheticEvent, newValue: PageType) => {
    setCurrentPage(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <AppBar position="static" color="primary" elevation={3} sx={{
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
      }}>
        <Toolbar sx={{
          display: 'flex',
          justifyContent: 'space-between', // ชื่อแอปอยู่ซ้าย, กลุ่มปุ่มอยู่ขวา
          alignItems: 'center',
          py: { xs: 1, sm: 2 },
          flexWrap: 'wrap',
          // gap: { xs: 1, sm: 2 } // ลบ gap ออก เพราะเราจะใช้ flexbox จัดเอง
        }}>
          {/* ชื่อแอป - จัดให้อยู่ซ้ายสุด */}
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              color: 'white',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              mr: 'auto', // ชื่อแอปจะชิดซ้ายสุดและดันองค์ประกอบอื่นไปขวา
            }}
          >
            ระบบจัดการออเดอร์ขนมปัง
          </Typography>

          {/* Group สำหรับ Tabs และ Fab (ปุ่มเพิ่มออเดอร์) - อยู่ทางขวา */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 }, // เพิ่ม gap ระหว่าง Tabs กับ Fab
            flexShrink: 0, // ไม่ให้หดตัว
          }}>
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
                  fontSize: { xs: '0.85rem', sm: '1.0rem' },
                  minWidth: { xs: 80, sm: 100 },
                  px: { xs: 1, sm: 2 },
                  color: 'rgba(255, 255, 255, 0.7)',
                  py: { xs: 1, sm: 1.5 },
                  transition: 'all 0.2s ease-in-out',
                  '&.Mui-selected': {
                    color: 'white',
                    fontWeight: 800,
                    fontSize: { xs: '1.0rem', sm: '1.1rem' },
                  },
                },
              }}
            >
              <Tab label="หน้าหลัก" value="home" />
              <Tab label="ประวัติ" value="history" />
            </Tabs>

            {/* ปุ่มเพิ่มออเดอร์ */}
            <Fab
              color="secondary"
              aria-label="add order"
              onClick={() => handleOpenForm()}
              size="medium"
              sx={{
                height: 48,
                width: 48,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                flexShrink: 0,
                // ml: { xs: 1, sm: 2 } // ไม่ต้องมี ml เพราะ gap ใน Box ด้านบนจัดการแล้ว
              }}
            >
              <AddIcon sx={{ fontSize: '1.8rem' }} />
            </Fab>
          </Box>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}>
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
                color: (theme) => theme.palette.grey[500],
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
  );
}

export default App;