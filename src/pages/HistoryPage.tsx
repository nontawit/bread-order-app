// src/pages/HistoryPage.tsx
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
  TextField,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import OrderCard from '../components/OrderCard';
import { Order } from '../types/order';
import { getOrders, deleteOrder } from '../utils/firebaseHelpers';

// สำหรับ DatePicker
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs'; // Import dayjs and Dayjs type
import 'dayjs/locale/th'; // Import Thai locale for dayjs
import th from 'dayjs/locale/th'; // Import th for setGlobal

dayjs.locale(th); // Set dayjs global locale to Thai

interface HistoryPageProps {
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

const HistoryPage: React.FC<HistoryPageProps> = ({ onEditOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null); // State สำหรับ DatePicker

  useEffect(() => {
    setLoading(true);
    let unsubscribe: () => void;

    if (selectedDate) {
      // ถ้าเลือกวันที่ ให้กรองเฉพาะวันนั้น
      const startOfDay = selectedDate.startOf('day').toDate();
      const endOfDay = selectedDate.endOf('day').toDate();
      unsubscribe = getOrders((fetchedOrders, err) => {
        if (err) {
          console.error("HistoryPage Error: Failed to fetch orders for selected date.", err);
          setError("ไม่สามารถโหลดรายการออเดอร์สำหรับวันที่เลือกได้");
        } else {
          setOrders(fetchedOrders.sort((a, b) => b.createdAt - a.createdAt));
          setError(null);
        }
        setLoading(false);
      }, startOfDay, endOfDay);
    } else {
      // ถ้าไม่ได้เลือกวันที่ ให้แสดงออเดอร์ทั้งหมด
      unsubscribe = getOrders((fetchedOrders, err) => {
        if (err) {
          console.error("HistoryPage Error: Failed to fetch all orders.", err);
          setError("ไม่สามารถโหลดรายการออเดอร์ทั้งหมดได้");
        } else {
          setOrders(fetchedOrders.sort((a, b) => b.createdAt - a.createdAt));
          setError(null);
        }
        setLoading(false);
      });
    }

    return () => unsubscribe();
  }, [selectedDate]); // Dependency on selectedDate: fetch data when selectedDate changes

  // คำนวณยอดรวมของออเดอร์ที่แสดงอยู่
  const totalItemsDisplayed = orders.reduce((sum, order) => sum + order.totalQuantity, 0);

  const handleEditClick = (order: Order) => {
    onEditOrder(order);
    console.log("HistoryPage: Edit button clicked for order:", order.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบออเดอร์นี้?")) {
      try {
        await deleteOrder(id);
        console.log("HistoryPage: Delete operation initiated for order ID:", id);
      } catch (err) {
        console.error("HistoryPage Error: Failed to delete order. ID:", id, err);
        alert("เกิดข้อผิดพลาดในการลบออเดอร์");
      }
    }
  };

  return (
    <Box>
      <div id="back-to-top-anchor"></div>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
        <DatePicker
          label="เลือกวันที่"
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          sx={{ mb: 2 }}
        />
      </LocalizationProvider>

      {/* สรุปยอดรวม */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          ยอดรวม{' '}
          {selectedDate
            ? `ของวันที่ ${selectedDate.format('D MMMM YYYY')}`
            : 'ทั้งหมดที่เคยขายมา'}
          : {totalItemsDisplayed} ลูก
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
                ไม่พบออเดอร์
            </Typography>
            <Typography variant="body1">
                {selectedDate ? `ไม่พบออเดอร์สำหรับวันที่ ${selectedDate.format('D MMMM YYYY')}` : 'ยังไม่เคยมีออเดอร์ในระบบเลย'}
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

export default HistoryPage;