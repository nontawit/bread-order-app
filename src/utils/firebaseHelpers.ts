// src/utils/firebaseHelpers.ts
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  Timestamp, // ตรวจสอบว่ามี import Timestamp
} from 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig'; // ตรวจสอบเส้นทางและไฟล์ firebaseConfig
import { Order, OrderStatus } from '../types/order';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Reference to the 'orders' collection
const ordersCollectionRef = collection(db, 'orders');

// Add a new order
export const addOrder = async (order: Omit<Order, 'id'>): Promise<void> => {
  try {
    const docRef = await addDoc(ordersCollectionRef, order);
    console.log("Firestore: Order added successfully with ID: ", docRef.id);
  } catch (e) {
    console.error("Firestore Error: Failed to add document.", e);
    throw e;
  }
};

// Get orders with real-time updates based on date range
export const getOrders = (
  callback: (orders: Order[], error: any) => void,
  startDate?: Date, // สามารถเป็น undefined ได้
  endDate?: Date    // สามารถเป็น undefined ได้
) => {
  let q; // ตัวแปรสำหรับเก็บ query object

  if (startDate && endDate) {
    // กรณีมีทั้ง startDate และ endDate (ใช้สำหรับช่วงเวลา)
    const startTimestamp = Timestamp.fromDate(startDate).toMillis(); // แปลง Date object เป็น milliseconds
    const endTimestamp = Timestamp.fromDate(endDate).toMillis();     // แปลง Date object เป็น milliseconds
    q = query(
      ordersCollectionRef,
      where('createdAt', '>=', startTimestamp),
      where('createdAt', '<=', endTimestamp),
      orderBy('createdAt', 'desc') // ต้องมี orderBy เมื่อใช้ where clause กับ createdAt
    );
    console.log(`Firestore: Querying orders from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
  } else if (startDate) { // กรณีมีแค่ Start Date (เช่น วันที่เดียวที่เลือกจาก DatePicker)
     // ทำให้ครอบคลุมทั้งวัน (ตั้งแต่ 00:00:00.000 ถึง 23:59:59.999 ของวันนั้น)
     const startOfDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
     const endOfDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 23, 59, 59, 999);
     const startTimestamp = Timestamp.fromDate(startOfDay).toMillis();
     const endTimestamp = Timestamp.fromDate(endOfDay).toMillis();
     q = query(
       ordersCollectionRef,
       where('createdAt', '>=', startTimestamp),
       where('createdAt', '<=', endTimestamp),
       orderBy('createdAt', 'desc') // ต้องมี orderBy เมื่อใช้ where clause กับ createdAt
     );
     console.log(`Firestore: Querying orders for specific date ${startDate.toLocaleDateString()}`);
  } else {
    // ถ้าไม่มี startDate หรือ endDate (ทั้งคู่เป็น undefined) ให้ดึงออเดอร์ทั้งหมด
    q = query(ordersCollectionRef, orderBy('createdAt', 'desc'));
    console.log("Firestore: Querying all orders.");
  }

  // Real-time listener
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    console.log("Firestore: Real-time orders fetched. Total:", orders.length);
    callback(orders, null);
  }, (error) => {
    console.error("Firestore Error: Failed to fetch real-time orders.", error);
    callback([], error);
  });

  return unsubscribe; // คืนค่า unsubscribe function เพื่อ cleanup listener
};

// Update an existing order
export const updateOrder = async (id: string, order: Partial<Order>): Promise<void> => {
  try {
    const orderDoc = doc(db, 'orders', id);
    await updateDoc(orderDoc, order);
    console.log("Firestore: Order updated successfully! ID:", id);
  } catch (e) {
    console.error("Firestore Error: Failed to update document. ID:", id, e);
    throw e;
  }
};

// Update only the status of an order
export const updateOrderStatus = async (id: string, newStatus: OrderStatus): Promise<void> => {
  try {
    const orderDoc = doc(db, 'orders', id);
    await updateDoc(orderDoc, { status: newStatus });
    console.log(`Firestore: Order ${id} status updated to ${newStatus}`);
  } catch (e) {
    console.error("Firestore Error: Failed to update order status. ID:", id, e);
    throw e;
  }
};

// Delete an order
export const deleteOrder = async (id: string): Promise<void> => {
  try {
    const orderDoc = doc(db, 'orders', id);
    await deleteDoc(orderDoc);
    console.log("Firestore: Order deleted successfully! ID:", id);
  } catch (e) {
    console.error("Firestore Error: Failed to delete document. ID:", id, e);
    throw e;
  }
};