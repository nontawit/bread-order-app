// src/firebaseConfig.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZhVg0HYFivn31M8csgzXnsY1aeFEKGZ0", // แทนที่ด้วยของคุณ
  authDomain: "bakery-order-app-firebase.firebaseapp.com", // แทนที่ด้วยของคุณ
  projectId: "bakery-order-app-firebase", // แทนที่ด้วยของคุณ
  storageBucket: "bakery-order-app-firebase.firebasestorage.app", // แทนที่ด้วยของคุณ
  messagingSenderId: "646249268531", // แทนที่ด้วยของคุณ
  appId: "1:646249268531:web:33c48fe80b6b40cf79ea46" // แทนที่ด้วยของคุณ
};
// Initialize Firebase
const app = initializeApp(firebaseConfig as any); // as any เพื่อเลี่ยง type error ชั่วคราว
const db = getFirestore(app);

export { db, firebaseConfig };