// src/components/AddEditOrderForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  IconButton,
  InputAdornment, // ยังคง import ไว้เผื่ออนาคต
  FormGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import { Order, OrderItem, Filling } from '../types/order';

interface AddEditOrderFormProps {
  initialOrder?: Order; // ถ้ามีคือโหมดแก้ไข
  onSubmit: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
  onCancel?: () => void;
}

const fillings: Filling[] = [
  'สังขยาใบเตย',
  'สังขยาไข่',
  'เนยนม',
  'เนยน้ำตาล',
  'ช็อกโกแลตกล้วย',
  'โอวัลตินนม',
  'หมูหยองพริกเผา',
];

const AddEditOrderForm: React.FC<AddEditOrderFormProps> = ({
  initialOrder,
  onSubmit,
  onCancel,
}) => {
  const [customerName, setCustomerName] = useState(initialOrder?.customerName || '');
  const [items, setItems] = useState<OrderItem[]>(initialOrder?.items || []);
  const [totalQuantity, setTotalQuantity] = useState(initialOrder?.totalQuantity || 0);
  const [nameError, setNameError] = useState(false);
  const [itemsError, setItemsError] = useState(false);

  useEffect(() => {
    const newTotalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    setTotalQuantity(newTotalQuantity);
    if (items.length > 0) setItemsError(false);
  }, [items]);

  useEffect(() => {
      if (customerName.trim()) setNameError(false);
  }, [customerName]);


  const handleFillingChange = (filling: Filling, checked: boolean) => {
    if (checked) {
      setItems((prevItems) => [...prevItems, { filling, quantity: 1 }]);
    } else {
      setItems((prevItems) =>
        prevItems.filter((item) => item.filling !== filling)
      );
    }
  };

  const handleQuantityChange = (filling: Filling, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.filling === filling ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  // Helper function to get item quantity
  const getItemQuantity = (filling: Filling) => {
    const item = items.find((i) => i.filling === filling);
    return item ? item.quantity : 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    if (!customerName.trim()) {
      setNameError(true);
      valid = false;
    }
    if (items.length === 0) {
      setItemsError(true);
      valid = false;
    }

    if (!valid) {
        console.log("AddEditOrderForm: Form validation failed.");
        return;
    }
    console.log("AddEditOrderForm: Form is valid, calling onSubmit with:", { customerName, items, totalQuantity });
    onSubmit({ customerName, items, totalQuantity });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: { xs: 0, sm: 0 },
        maxWidth: '100%',
        margin: 'auto',
      }}
    >
      {onCancel && (
        <IconButton
          aria-label="close"
          onClick={onCancel}
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

      <TextField
        label="ชื่อลูกค้า"
        fullWidth
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        margin="normal"
        required
        error={nameError}
        helperText={nameError ? 'กรุณากรอกชื่อลูกค้า' : ''}
      />

      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        เลือกไส้และจำนวน
      </Typography>
      <FormGroup>
        {fillings.map((filling) => {
          const isChecked = items.some((i) => i.filling === filling);
          const currentQuantity = getItemQuantity(filling);

          return (
            <Box key={filling} display="flex" alignItems="center" mb={1} sx={{ gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isChecked}
                    onChange={(e) => handleFillingChange(filling, e.target.checked)}
                  />
                }
                label={<Typography variant="body1">{filling}</Typography>}
                sx={{ flexGrow: 1 }}
              />
              {isChecked && (
                <Box display="flex" alignItems="center" sx={{ gap: 0.5 }}>
                    <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(filling, currentQuantity - 1)}
                        disabled={currentQuantity <= 1}
                        aria-label="decrease quantity"
                    >
                        <RemoveIcon fontSize="small" />
                    </IconButton>
                    {/* ตรงนี้คือส่วนที่เปลี่ยน: เปลี่ยน TextField เป็น Typography เพื่อแสดงผลลัพธ์เท่านั้น */}
                    <Typography
                        variant="body1"
                        sx={{
                            minWidth: 30, // กำหนดความกว้างขั้นต่ำ
                            textAlign: 'center',
                            fontWeight: 'bold',
                            mx: 0.5, // margin ซ้ายขวา
                            display: 'inline-block' // เพื่อให้ minWidth ทำงาน
                        }}
                    >
                        {currentQuantity}
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(filling, currentQuantity + 1)}
                        aria-label="increase quantity"
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                </Box>
              )}
            </Box>
          );
        })}
      </FormGroup>
      {itemsError && (
          <Typography color="error" variant="caption" sx={{ ml: 1.5, mt: 0.5 }}>
              กรุณาเลือกไส้อย่างน้อย 1 อย่าง
          </Typography>
      )}


      <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
        รวม: {totalQuantity} ลูก
      </Typography>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          sx={{ flexGrow: 1 }}
        >
          {initialOrder ? 'อัพเดทออเดอร์' : 'เพิ่มออเดอร์'}
        </Button>
        {onCancel && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={onCancel}
            size="large"
            sx={{ flexGrow: 1 }}
          >
            ยกเลิก
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default AddEditOrderForm;