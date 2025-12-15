import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserInfo, DrinkLog } from './userinfo/type';

const STORAGE_KEYS = {
    USER_INFO: '@water_mate:user_info',
    DRINK_LOGS: '@water_mate:drink_logs',
    IS_REGISTERED: '@water_mate:is_registered',
    PENDING_SYNC: '@water_mate:pending_sync',
    HAS_SEEN_ONBOARDING: '@water_mate:has_seen_onboarding',
};

export const getLocalUserId = async (): Promise<string> => {
    const existingId = await AsyncStorage.getItem('@water_mate:local_user_id');
    if (existingId) {
        return existingId;
    }
    const newId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem('@water_mate:local_user_id', newId);
    return newId;
};

export const saveUserInfoLocal = async (userInfo: UserInfo): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
    } catch (error) {
        console.error('Error saving user info locally:', error);
        throw error;
    }
};

export const getUserInfoLocal = async (): Promise<UserInfo | null> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
        if (data) {
            return JSON.parse(data) as UserInfo;
        }
        return null;
    } catch (error) {
        console.error('Error getting user info locally:', error);
        return null;
    }
};

export const saveDrinkLogLocal = async (log: Omit<DrinkLog, 'logId'>): Promise<DrinkLog> => {
    try {
        const logs = await getAllDrinkLogsLocal();
        const logId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newLog: DrinkLog = {
            ...log,
            logId,
            createdAt: log.createdAt || Date.now(),
        };
        logs.push(newLog);
        await AsyncStorage.setItem(STORAGE_KEYS.DRINK_LOGS, JSON.stringify(logs));
        return newLog;
    } catch (error) {
        console.error('Error saving drink log locally:', error);
        throw error;
    }
};

export const getAllDrinkLogsLocal = async (): Promise<DrinkLog[]> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.DRINK_LOGS);
        if (data) {
            return JSON.parse(data) as DrinkLog[];
        }
        return [];
    } catch (error) {
        console.error('Error getting drink logs locally:', error);
        return [];
    }
};

export const deleteDrinkLogLocal = async (logId: string): Promise<void> => {
    try {
        const logs = await getAllDrinkLogsLocal();
        const filteredLogs = logs.filter(log => log.logId !== logId);
        await AsyncStorage.setItem(STORAGE_KEYS.DRINK_LOGS, JSON.stringify(filteredLogs));
    } catch (error) {
        console.error('Error deleting drink log locally:', error);
        throw error;
    }
};

export const saveAllDrinkLogsLocal = async (logs: DrinkLog[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.DRINK_LOGS, JSON.stringify(logs));
    } catch (error) {
        console.error('Error saving all drink logs locally:', error);
        throw error;
    }
};

export const setIsRegistered = async (isRegistered: boolean): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.IS_REGISTERED, JSON.stringify(isRegistered));
};

export const getIsRegistered = async (): Promise<boolean> => {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.IS_REGISTERED);
    return data ? JSON.parse(data) : false;
};

export const markPendingSync = async (): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(true));
};

export const clearPendingSync = async (): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(false));
};

export const hasPendingSync = async (): Promise<boolean> => {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
    return data ? JSON.parse(data) : false;
};

export const setHasSeenOnboarding = async (hasSeen: boolean): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, JSON.stringify(hasSeen));
};

export const getHasSeenOnboarding = async (): Promise<boolean> => {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
    return data ? JSON.parse(data) : false;
};

export const clearAllLocalData = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.USER_INFO,
            STORAGE_KEYS.DRINK_LOGS,
            STORAGE_KEYS.IS_REGISTERED,
            STORAGE_KEYS.PENDING_SYNC,
            STORAGE_KEYS.HAS_SEEN_ONBOARDING,
            '@water_mate:local_user_id',
        ]);
    } catch (error) {
        console.error('Error clearing local data:', error);
        throw error;
    }
};

