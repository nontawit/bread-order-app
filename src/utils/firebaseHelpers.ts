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
  where, // เพิ่ม import where
  Timestamp, // เพิ่ม import Timestamp
} from 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig';
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
  startDate?: Date, // เพิ่ม startDate
  endDate?: Date // เพิ่ม endDate
) => {
  let q = query(ordersCollectionRef, orderBy('createdAt', 'desc'));

  if (startDate && endDate) {
    // แปลง Date เป็น Timestamp สำหรับการ Query ใน Firestore
    const startTimestamp = Timestamp.fromDate(startDate).toMillis();
    const endTimestamp = Timestamp.fromDate(endDate).toMillis();
    q = query(
      ordersCollectionRef,
      where('createdAt', '>=', startTimestamp), // กรองวันที่เริ่มต้น
      where('createdAt', '<=', endTimestamp), // กรองวันที่สิ้นสุด
      orderBy('createdAt', 'desc')
    );
    console.log(`Firestore: Querying orders from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
  } else if (startDate) { // กรณีมีแค่ Start Date แต่ไม่มี End Date (เช่น ต้องการเฉพาะวันนั้น)
     const startOfDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
     const endOfDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 23, 59, 59, 999);
     const startTimestamp = Timestamp.fromDate(startOfDay).toMillis();
     const endTimestamp = Timestamp.fromDate(endOfDay).toMillis();
     q = query(
       ordersCollectionRef,
       where('createdAt', '>=', startTimestamp),
       where('createdAt', '<=', endTimestamp),
       orderBy('createdAt', 'desc')
     );
     console.log(`Firestore: Querying orders for date ${startDate.toLocaleDateString()}`);
  } else {
    console.log("Firestore: Querying all orders.");
  }


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

  return unsubscribe;
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