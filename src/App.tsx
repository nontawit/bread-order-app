// src/App.tsx
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Fab, useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import HomePage from './pages/HomePage';
import AddEditOrderForm from './components/AddEditOrderForm';
import { Order, OrderStatus } from './types/order'; // Import Order and OrderStatus
import { addOrder, updateOrder } from './utils/firebaseHelpers'; // Import addOrder, updateOrder

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>(undefined); // State สำหรับเก็บข้อมูลออเดอร์ที่กำลังแก้ไข
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ฟังก์ชันสำหรับเปิด Dialog พร้อมกำหนดว่าเป็นการเพิ่มหรือแก้ไข
  const handleOpenForm = (orderToEdit?: Order) => {
    setEditingOrder(orderToEdit); // ตั้งค่าออเดอร์ที่จะแก้ไข (ถ้ามี)
    setIsFormOpen(true);
  };

  // ฟังก์ชันสำหรับปิด Dialog และล้างค่า editingOrder
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingOrder(undefined); // ล้างค่า editingOrder เมื่อปิด Dialog เพื่อเตรียมพร้อมสำหรับการเพิ่มใหม่
  };

  // ฟังก์ชันที่ถูกเรียกเมื่อฟอร์ม AddEditOrderForm ถูก submit
  const handleAddEditOrderSubmit = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    console.log("App.tsx: handleAddEditOrderSubmit called with orderData:", orderData);
    try {
      if (editingOrder) {
        // ถ้าเป็นการแก้ไขออเดอร์
        await updateOrder(editingOrder.id!, {
          ...orderData,
          status: editingOrder.status, // สถานะยังคงเดิมตอนแก้ไข
          createdAt: editingOrder.createdAt, // เวลาสร้างยังคงเดิม
        });
        console.log("App.tsx: Update order operation initiated.");
      } else {
        // ถ้าเป็นการเพิ่มออเดอร์ใหม่
        await addOrder({
          ...orderData,
          status: 'รอคิว' as OrderStatus, // ออเดอร์ใหม่เริ่มต้นที่สถานะ 'รอคิว'
          createdAt: Date.now(), // บันทึกเวลาที่สร้าง
        });
        console.log("App.tsx: Add new order operation initiated.");
      }
      handleCloseForm(); // ปิด Dialog หลังจากบันทึกสำเร็จ
    } catch (err) {
      console.error("App.tsx Error: Failed to save order.", err); // เพิ่ม error logging
      alert("เกิดข้อผิดพลาดในการบันทึกออเดอร์ กรุณาตรวจสอบ Console");
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
          >
            รายการออเดอร์ขนมปัง
          </Typography>
          {/* ปุ่ม + เพิ่มออเดอร์ บน AppBar */}
          <Fab
            color="secondary" // ใช้สี secondary เพื่อให้ตัดกับ primary ของ AppBar
            aria-label="add order"
            onClick={() => handleOpenForm()} // เรียก handleOpenForm โดยไม่มี order parameter เพื่อเป็นการเพิ่มใหม่
            size="small" // ทำให้ปุ่มเล็กลง เหมาะสำหรับ AppBar
            sx={{
              minWidth: { xs: 'auto', sm: 'auto' },
              borderRadius: '50%', // ให้เป็นวงกลมเสมอ
              p: 0, // ลบ padding ภายใน
              height: 40, // กำหนดความสูง
              width: 40, // กำหนดความกว้าง
              boxShadow: 0, // ลบเงาเพื่อความเรียบง่าย
            }}
          >
            <AddIcon sx={{ fontSize: '1.5rem' }} />
          </Fab>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        {/* ส่ง onEditOrder ไปให้ HomePage เพื่อให้ HomePage เรียก App.tsx เมื่อต้องการแก้ไข */}
        <HomePage onEditOrder={handleOpenForm} />
      </Container>

      {/* Dialog สำหรับฟอร์มเพิ่ม/แก้ไขออเดอร์ ควบคุมโดย App.tsx */}
      <Dialog
        open={isFormOpen}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ textAlign: 'center', py: { xs: 2, sm: 3 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {editingOrder ? 'แก้ไขออเดอร์' : 'เพิ่มออเดอร์ใหม่'}
          {isMobile && ( // ปุ่มปิดสำหรับ Mobile Fullscreen Dialog
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
            initialOrder={editingOrder} // ส่งข้อมูลออเดอร์ที่กำลังแก้ไข (ถ้ามี)
            onSubmit={handleAddEditOrderSubmit} // onSubmit จะเรียก handleAddEditOrderSubmit
            onCancel={handleCloseForm} // onCancel จะเรียก handleCloseForm
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default App;