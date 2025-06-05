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
  onSnapshot, // Import onSnapshot
} from 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig'; // ตรวจสอบให้แน่ใจว่า import ถูกต้อง
import { Order, OrderStatus } from '../types/order'; // Import Order and OrderStatus (เผื่อยังไม่มี)

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Reference to the 'orders' collection
const ordersCollectionRef = collection(db, 'orders');

// Add a new order
export const addOrder = async (order: Omit<Order, 'id'>): Promise<void> => {
  try {
    const docRef = await addDoc(ordersCollectionRef, order);
    console.log("Firestore: Order added successfully with ID: ", docRef.id); // เพิ่ม console.log ที่มี ID
  } catch (e) {
    console.error("Firestore Error: Failed to add document.", e); // ข้อความ error ที่ชัดเจนขึ้น
    throw e; // โยน error กลับไปให้ส่วนที่เรียกใช้รับทราบ
  }
};

// Get orders with real-time updates
// Callback function will be called whenever data changes
export const getOrders = (callback: (orders: Order[], error: any) => void) => {
  const q = query(ordersCollectionRef, orderBy('createdAt', 'desc')); // เรียงตามเวลาสร้างจากใหม่ไปเก่า

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    console.log("Firestore: Real-time orders fetched. Total:", orders.length); // เพิ่ม console.log
    callback(orders, null); // Pass the fetched orders to the callback
  }, (error) => {
    console.error("Firestore Error: Failed to fetch real-time orders.", error); // ข้อความ error ที่ชัดเจนขึ้น
    callback([], error); // Pass error to the callback
  });

  return unsubscribe; // Return the unsubscribe function to stop listening
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