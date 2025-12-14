// /util/firebaseConfig.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Cấu hình Firebase của bạn
// LƯU Ý: Nếu gặp lỗi "api-key-not-valid", vui lòng:
// 1. Vào Firebase Console: https://console.firebase.google.com/
// 2. Chọn project của bạn (watermate-app-9fa72 hoặc watermateapp)
// 3. Vào Project Settings > General > Your apps > Web app
// 4. Copy các giá trị từ Firebase SDK snippet và cập nhật vào đây
// 
// Hoặc nếu bạn có file google-services.json, project_id là "watermate-app-9fa72"
// thì cần tạo Web app mới trong Firebase Console để lấy cấu hình cho Web SDK

const firebaseConfig = {
  apiKey: "AIzaSyCbmoA13QvE9VbooSIeyi_hIfx2yX_-_lA",
  authDomain: "watermate-app-9fa72.firebaseapp.com",
  projectId: "watermate-app-9fa72",
  storageBucket: "watermate-app-9fa72.firebasestorage.app",
  messagingSenderId: "525457089180",
  appId: "1:525457089180:web:e6d7e1eb52bd702a790359"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Khởi tạo Auth với AsyncStorage persistence
// Sử dụng initializeAuth thay vì getAuth để cung cấp AsyncStorage cho React Native
// Điều này cho phép auth state được lưu giữ giữa các sessions
let auth: Auth;
try {
  // Thử import getReactNativePersistence - có thể có trong một số phiên bản
  let getReactNativePersistence: any;
  try {
    // Thử import từ firebase/auth
    const authModule = require('firebase/auth');
    getReactNativePersistence = authModule.getReactNativePersistence;

    // Nếu không có, thử import từ firebase/auth/react-native
    if (!getReactNativePersistence) {
      try {
        const rnAuthModule = require('firebase/auth/react-native');
        getReactNativePersistence = rnAuthModule.getReactNativePersistence;
      } catch (e) {
        // Module không tồn tại
      }
    }
  } catch (e) {
    // Không thể import, sẽ dùng fallback
  }

  // Nếu có getReactNativePersistence, sử dụng nó
  if (getReactNativePersistence) {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } else {
    // Fallback: sử dụng getAuth (sẽ có warning nhưng vẫn hoạt động)
    auth = getAuth(app);
  }
} catch (error: any) {
  // Nếu auth đã được khởi tạo trước đó (ví dụ trong hot reload), sử dụng getAuth
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

export { db, auth };
