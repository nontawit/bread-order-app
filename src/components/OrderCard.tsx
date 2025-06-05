// src/components/OrderCard.tsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import { Order, OrderStatus } from '../types/order';
import { updateOrderStatus } from '../utils/firebaseHelpers';

interface OrderCardProps {
  order: Order;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
}

const statusMap: Record<OrderStatus, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; icon: React.ReactElement }> = { // เปลี่ยน type ของ icon เป็น React.ReactElement
  รอคิว: { label: 'รอคิว', color: 'default', icon: <AccessTimeIcon fontSize="small" /> },
  ดำเนินการ: { label: 'กำลังดำเนินการ', color: 'warning', icon: <PlayCircleIcon fontSize="small" /> },
  เสร็จสิ้น: { label: 'เสร็จสิ้น', color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
};
const OrderCard: React.FC<OrderCardProps> = ({ order, onEdit, onDelete }) => {
  const [openStatusDialog, setOpenStatusDialog] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(order.id!, newStatus);
      console.log(`OrderCard: Status update initiated for order ${order.id} to ${newStatus}`);
      setOpenStatusDialog(false);
    } catch (error) {
      console.error("OrderCard Error: Failed to update status.", error);
      alert("เกิดข้อผิดพลาดในการอัพเดทสถานะ");
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card sx={{ mb: 2, boxShadow: 3, borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: { xs: '1.15rem', sm: '1.25rem' } }}>
            ลูกค้า: {order.customerName}
          </Typography>
         <Chip
            label={statusMap[order.status].label}
            color={statusMap[order.status].color}
            icon={statusMap[order.status].icon} // ตรงนี้ตอนนี้จะถูกต้องแล้ว เพราะ Type ของ icon ใน statusMap ถูกบังคับให้เป็น React.ReactElement
            size={isMobile ? "small" : "medium"}
            sx={{ fontWeight: 'bold' }}
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
          สร้างเมื่อ: {formatDate(order.createdAt)}
        </Typography>

        <Box sx={{ mt: 1, mb: 1 }}>
          {order.items.map((item, index) => (
            <Typography key={index} variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              • {item.filling}: {item.quantity} ลูก
            </Typography>
          ))}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
          รวม: {order.totalQuantity} ลูก
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexDirection: isMobile ? 'column' : 'row' }}>
          <Button
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            onClick={() => onEdit(order)}
            startIcon={<EditIcon />}
            sx={{ flexGrow: 1 }}
          >
            แก้ไข
          </Button>
          <Button
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            onClick={() => setOpenStatusDialog(true)}
            startIcon={<CheckCircleIcon />}
            color="info"
            sx={{ flexGrow: 1 }}
          >
            อัพเดทสถานะ
          </Button>
          <IconButton
            color="error"
            onClick={() => onDelete(order.id!)}
            size={isMobile ? "small" : "medium"}
            sx={{ display: isMobile ? 'flex' : 'none', justifyContent: 'center' }}
          >
              <DeleteIcon />
          </IconButton>
          <Button
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            onClick={() => onDelete(order.id!)}
            startIcon={<DeleteIcon />}
            color="error"
            sx={{ flexGrow: 1, display: isMobile ? 'none' : 'flex' }}
          >
            ลบ
          </Button>
        </Box>
      </CardContent>

      {/* Status Update Dialog */}
      <Dialog
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          เปลี่ยนสถานะ
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <List>
            {Object.keys(statusMap).map((statusKey) => {
              const status = statusKey as OrderStatus;
              return (
                <ListItem
                  component="button"
                  key={statusKey}
                  onClick={() => handleStatusChange(status)}
                  sx={{
                    justifyContent: 'center',
                    bgcolor: order.status === status ? theme.palette.primary.light + '10' : 'inherit',
                    '&:hover': {
                        bgcolor: order.status === status ? theme.palette.primary.light + '20' : theme.palette.action.hover,
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {statusMap[status].icon}
                        <Typography variant="body1" sx={{ fontWeight: order.status === status ? 600 : 400 }}>
                          {statusMap[status].label}
                        </Typography>
                      </Stack>
                    }
                    sx={{ textAlign: 'center' }}
                  />
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default OrderCard;