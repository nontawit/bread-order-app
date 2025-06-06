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
  useScrollTrigger,
  TextField, // ตรวจสอบว่าได้ import TextField แล้ว
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import OrderCard from '../components/OrderCard';
import { Order } from '../types/order';
import { getOrders, deleteOrder } from '../utils/firebaseHelpers';

// สำหรับ DatePicker
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs'; // ตรวจสอบว่าได้ import Dayjs type มาด้วย
import 'dayjs/locale/th';
import th from 'dayjs/locale/th';
// Import plugin สำหรับปีพุทธศักราช
import buddhistEra from 'dayjs/plugin/buddhistEra';

// Set locale for Dayjs globally
dayjs.locale(th);
// ใช้ plugin สำหรับปีพุทธศักราช
dayjs.extend(buddhistEra);

interface HistoryPageProps {
  onEditOrder: (order: Order) => void;
}

// Component สำหรับปุ่ม Scroll To Top
interface ScrollTopProps {
  children: React.ReactElement;
}

function ScrollTop(props: ScrollTopProps) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (
      (event.target as HTMLDivElement).ownerDocument || document
    ).querySelector('#back-to-top-anchor');

    if (anchor) {
      anchor.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }} // เพิ่ม zIndex
      >
        {children}
      </Box>
    </Zoom>
  );
}
// สิ้นสุด ScrollTop component

const HistoryPage: React.FC<HistoryPageProps> = ({ onEditOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Initial state for selectedDate should be null to indicate no date is selected
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let unsubscribe: () => void;

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    // ตรวจสอบว่า selectedDate ไม่ใช่ null และเป็น Dayjs object ที่ถูกต้อง
    if (selectedDate && selectedDate.isValid()) {
      startDate = selectedDate.startOf('day').toDate();
      endDate = selectedDate.endOf('day').toDate();
      console.log(`HistoryPage: Fetching orders for date: ${selectedDate.format('YYYY-MM-DD')}`);
    } else {
      console.log("HistoryPage: Fetching all orders (no valid date selected).");
    }

    unsubscribe = getOrders((fetchedOrders, err) => {
      if (err) {
        console.error("HistoryPage Error: Failed to fetch orders.", err);
        setError("ไม่สามารถโหลดรายการออเดอร์ได้");
      } else {
        // Sort orders by createdAt in descending order (newest first)
        setOrders(fetchedOrders.sort((a, b) => b.createdAt - a.createdAt));
        setError(null);
      }
      setLoading(false);
    }, startDate, endDate);

    return () => unsubscribe(); // Cleanup Firebase listener on component unmount or dependency change
  }, [selectedDate]); // Dependency on selectedDate: fetch data when selectedDate changes

  // คำนวณ totalItemsDisplayed
  const totalItemsDisplayed = orders.reduce((sum, order) => {
    if (order.items && Array.isArray(order.items)) {
      const orderTotalItems = order.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
      return sum + orderTotalItems;
    }
    return sum; // ถ้า order.items ไม่ถูกต้อง ให้คืนค่า sum เดิม
  }, 0);

  const handleEditClick = (order: Order) => {
    onEditOrder(order);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณต้องการลบออเดอร์นี้หรือไม่?')) {
      try {
        await deleteOrder(id);
        alert('ลบออเดอร์สำเร็จ!');
      } catch (err) {
        console.error("Error deleting order:", err);
        alert('เกิดข้อผิดพลาดในการลบออเดอร์');
      }
    }
  };

  return (
    <Box>
      <div id="back-to-top-anchor"></div> {/* Anchor สำหรับ ScrollTop */}

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
        <DatePicker
          label="เลือกวันที่"
          value={selectedDate} // ค่าที่แสดงใน DatePicker
          onChange={(newValue) => {
            // ตรวจสอบว่า newValue เป็น Dayjs object ที่ถูกต้องหรือไม่ ก่อนที่จะตั้งค่า state
            // ถ้า newValue เป็น null (เช่น ผู้ใช้กด Clear) หรือไม่ valid, ให้ตั้ง state เป็น null
            setSelectedDate(newValue && newValue.isValid() ? newValue : null);
          }}
          // *** แก้ไขที่นี่: เพิ่ม prop นี้เพื่อแก้ไข error sectionListRef ***
          enableAccessibleFieldDOMStructure={false}
          // เพิ่ม format prop เพื่อช่วยให้ DatePicker แสดงผลวันที่ถูกต้องเสมอ
          // ใช้ 'BBBB' สำหรับปีพุทธศักราช
          format="DD MMMM BBBB" // ตัวอย่าง: 06 มิถุนายน 2568
          slots={{ textField: TextField }}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: "normal",
              // สามารถเพิ่ม error handling หรือ helperText ที่นี่ได้ถ้าต้องการ
            },
          }}
          sx={{ mb: 2 }}
        />
      </LocalizationProvider>

      {/* สรุปยอดรวม */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          ยอดรวม{' '}
          {selectedDate && selectedDate.isValid() // ตรวจสอบก่อนแสดงผลวันที่
            ? `ของวันที่ ${selectedDate.format('D MMMM BBBB')}`
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
            p: 2,
            flexDirection: 'column'
        }}>
          <Alert severity="info" variant="outlined" sx={{ maxWidth: 400, boxShadow: 1 }}>
            <Typography variant="h6" gutterBottom>
                ไม่พบออเดอร์
            </Typography>
            <Typography variant="body1">
                {selectedDate && selectedDate.isValid() ? `ไม่พบออเดอร์สำหรับวันที่ ${selectedDate.format('D MMMM BBBB')}` : 'ยังไม่เคยมีออเดอร์ในระบบเลย'}
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

      {/* ปุ่ม Scroll To Top */}
      <ScrollTop>
        <Fab color="secondary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </Box>
  );
};

export default HistoryPage;