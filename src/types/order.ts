// src/types/order.ts

export type Filling =
  | 'สังขยาใบเตย'
  | 'สังขยาไข่'
  | 'เนยนม'
  | 'เนยน้ำตาล'
  | 'ช็อกโกแลตกล้วย'
  | 'โอวัลตินนม'
  | 'หมูหยองพริกเผา';

export type OrderStatus = 'รอคิว' | 'ดำเนินการ' | 'เสร็จสิ้น';

export interface OrderItem {
  filling: Filling;
  quantity: number;
}

// ต้องมี 'export' ตรงนี้!
export interface Order {
  id?: string; // Optional for new orders before saving to Firebase
  customerName: string;
  items: OrderItem[];
  totalQuantity: number;
  status: OrderStatus;
  createdAt: number; // Timestamp
}