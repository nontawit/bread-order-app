// src/pages/HomePage.tsx
import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Stack,
  Fab,
  Zoom,
  useMediaQuery,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import OrderCard from '../components/OrderCard';
import { Order } from '../types/order';
import {
  getOrders,
  deleteOrder,
} from '../utils/firebaseHelpers';

interface HomePageProps {
    onEditOrder: (order: Order) => void;
}

// Component สำหรับปุ่ม Scroll to Top (ยังคงเหมือนเดิม)
interface ScrollTopProps {
  children: React.ReactElement;
}

function ScrollTop(props: ScrollTopProps) {
  const { children } = props;
  const trigger = useMediaQuery((theme: any) => theme.breakpoints.up('sm') ? '(min-scroll-y: 100px)' : '(min-scroll-y: 50px)');

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLDivElement).ownerDocument.querySelector(
      '#back-to-top-anchor',
    );

    if (anchor) {
      anchor.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        {children}
      </Box>
    </Zoom>
  );
}

const HomePage: React.FC<HomePageProps> = ({ onEditOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // กรองออเดอร์สำหรับวันนี้เท่านั้น
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const unsubscribe = getOrders((fetchedOrders, err) => {
      if (err) {
        console.error("HomePage Error: Failed to fetch orders.", err);
        setError("ไม่สามารถโหลดรายการออเดอร์ได้");
      } else {
        setOrders(fetchedOrders.sort((a, b) => b.createdAt - a.createdAt));
        setError(null);
      }
      setLoading(false);
    }, startOfDay, endOfDay); // ส่ง startDate และ endDate ไป

    return () => unsubscribe();
  }, []);

  // คำนวณยอดรวมของออเดอร์ในวันนี้
  const totalItemsToday = orders.reduce((sum, order) => sum + order.totalQuantity, 0);

  const handleEditClick = (order: Order) => {
    onEditOrder(order);
    console.log("HomePage: Edit button clicked for order:", order.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบออเดอร์นี้?")) {
      try {
        await deleteOrder(id);
        console.log("HomePage: Delete operation initiated for order ID:", id);
      } catch (err) {
        console.error("HomePage Error: Failed to delete order. ID:", id, err);
        alert("เกิดข้อผิดพลาดในการลบออเดอร์");
      }
    }
  };

  return (
    <Box>
      <div id="back-to-top-anchor"></div>

      {/* แสดงยอดรวมของวันนี้ */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          ยอดรวมของวันนี้: {totalItemsToday} ลูก
        </Typography>
      </Alert>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 400px)' }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && orders.length === 0 && (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 400px)',
            textAlign: 'center',
            p: 2
        }}>
          <Alert severity="info" variant="outlined" sx={{ maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>
                ยังไม่มีออเดอร์สำหรับวันนี้!
            </Typography>
            <Typography variant="body1">
                ลองเพิ่มออเดอร์ใหม่ได้เลย โดยกดปุ่ม "เพิ่มออเดอร์" บน App Bar
            </Typography>
          </Alert>
        </Box>
      )}

      {!loading && !error && orders.length > 0 && (
        <Stack spacing={2}>
          {orders.map((order) => (
            <OrderCard
                key={order.id}
                order={order}
                onEdit={handleEditClick}
                onDelete={handleDelete}
            />
          ))}
        </Stack>
      )}

      <ScrollTop>
        <Fab color="secondary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </Box>
  );
};

export default HomePage;