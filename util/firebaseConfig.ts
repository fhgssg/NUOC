import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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

let auth: Auth;
try {
  let getReactNativePersistence: any;
  try {
    const authModule = require('firebase/auth');
    getReactNativePersistence = authModule.getReactNativePersistence;

    if (!getReactNativePersistence) {
      try {
        const rnAuthModule = require('firebase/auth/react-native');
        getReactNativePersistence = rnAuthModule.getReactNativePersistence;
      } catch (e) {
      }
    }
  } catch (e) {
  }

  if (getReactNativePersistence) {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } else {
    auth = getAuth(app);
  }
} catch (error: any) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

export { db, auth };
