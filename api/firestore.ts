// /api/firestore.ts

import {
    doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, deleteDoc, updateDoc
} from 'firebase/firestore';
import { db } from '../util/firebaseConfig';
import { UserInfo, DrinkLog } from '../storage/userinfo/type';

const USERS_COLLECTION = 'users';
const DRINK_LOGS_COLLECTION = 'drink_logs';

// ----------------------------------------------------
// USER INFO API (Thao tác với Collection 'users')
// ----------------------------------------------------

export const saveUserInfo = async (userInfo: UserInfo): Promise<void> => {
    const userRef = doc(db, USERS_COLLECTION, userInfo.userId);
    await setDoc(userRef, userInfo);
};

export const getUserInfo = async (userId: string): Promise<UserInfo | null> => {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const userData = docSnap.data() as UserInfo;
            console.log('User info retrieved from Firestore:', userId);
            return userData;
        }
        console.log('User info not found in Firestore:', userId);
        return null;
    } catch (error) {
        console.error('Error getting user info from Firestore:', error);
        return null;
    }
};

export const updateUserInfo = async (userId: string, data: Partial<UserInfo>): Promise<void> => {
    // Lỗi SyntaxError 'const const' đã được sửa ở đây
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, data);
};


// ----------------------------------------------------
// DRINK LOGS API (Thao tác với Collection 'drink_logs')
// ----------------------------------------------------

export const addDrinkLog = async (log: Omit<DrinkLog, 'logId'>): Promise<DrinkLog> => {
    const colRef = collection(db, DRINK_LOGS_COLLECTION);

    const newLogData = {
        ...log,
        createdAt: Date.now()
    };

    const newDoc = await addDoc(colRef, newLogData);

    return { ...newLogData, logId: newDoc.id } as DrinkLog;
};

export const getDailyDrinkLogs = async (userId: string, date: string): Promise<DrinkLog[]> => {
    const q = query(
        collection(db, DRINK_LOGS_COLLECTION),
        where('userId', '==', userId),
        where('date', '==', date)
    );

    const querySnapshot = await getDocs(q);
    const logs: DrinkLog[] = [];

    querySnapshot.forEach(doc => {
        logs.push({ logId: doc.id, ...doc.data() } as DrinkLog);
    });

    // Sắp xếp theo createdAt giảm dần (mới nhất ở đầu)
    return logs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
};

export const getAllDrinkLogs = async (userId: string): Promise<DrinkLog[]> => {
    const q = query(
        collection(db, DRINK_LOGS_COLLECTION),
        where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const logs: DrinkLog[] = [];

    querySnapshot.forEach(doc => {
        logs.push({ logId: doc.id, ...doc.data() } as DrinkLog);
    });

    // Sắp xếp theo createdAt giảm dần (mới nhất ở đầu)
    return logs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
};

export const deleteDrinkLog = async (logId: string): Promise<void> => {
    const logRef = doc(db, DRINK_LOGS_COLLECTION, logId);
    await deleteDoc(logRef);
};

// Delete all drink logs for a user
export const deleteAllDrinkLogs = async (userId: string): Promise<void> => {
    const q = query(
        collection(db, DRINK_LOGS_COLLECTION),
        where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
};

// Delete user account data (user info and all drink logs)
export const deleteUserAccount = async (userId: string): Promise<void> => {
    try {
        // Delete all drink logs
        await deleteAllDrinkLogs(userId);

        // Delete user info
        const userRef = doc(db, USERS_COLLECTION, userId);
        await deleteDoc(userRef);

        console.log('User account data deleted successfully');
    } catch (error) {
        console.error('Error deleting user account data:', error);
        throw error;
    }
};
