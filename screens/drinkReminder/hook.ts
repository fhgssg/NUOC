import { useEffect, useState } from 'react';
import { Platform, ToastAndroid } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  requestPermissionNotificationReminder,
  startReminder,
  ReminderInterval,
  getIntervalLabel,
} from './util';
import { useAuth } from '@/context/UserAuthContext';

const REMINDER_MINUTES_KEY = '@drinkReminder:customMinutes';

export const useDrinkReminder = () => {
  const { user: userInfo } = useAuth();
  const [isReminderActive, setIsReminderActive] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<ReminderInterval>('2hours');
  const [reminderMinutes, setReminderMinutes] = useState<number>(120);

  // Request notification permissions on load
  useEffect(() => {
    if (Platform.OS !== 'web') {
      requestPermissionNotificationReminder().then(({ status }) => {
        if (status !== 'granted') {
          alert('Permission for notifications is required to set reminders.');
        }
      });
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      getAllnoti();
      loadReminderMinutes();
    }
  }, []);

  const loadReminderMinutes = async () => {
    try {
      const stored = await AsyncStorage.getItem(REMINDER_MINUTES_KEY);
      if (stored !== null) {
        const minutes = parseInt(stored, 10);
        if (!isNaN(minutes) && minutes > 0) {
          setReminderMinutes(minutes);
        }
      }
    } catch (error) {
      console.error('Error loading reminder minutes:', error);
    }
  };

  const getAllnoti = async () => {
    if (Platform.OS === 'web') {
      setIsReminderActive(false);
      return;
    }
    try {
      const not = await Notifications.getAllScheduledNotificationsAsync();
      setIsReminderActive(not.length > 0);
    } catch (error) {
      console.error('Error getting notifications:', error);
      setIsReminderActive(false);
    }
  };
  // Cancel existing notifications if reminder is paused
  const toggleReminder = async () => {
    if (Platform.OS === 'web') {
      alert('Notifications are not available on web. Please use the mobile app.');
      return;
    }

    if (isReminderActive) {
      try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        if (Platform.OS === 'android') {
          ToastAndroid.show('Reminder is paused', 3000);
        } else {
          alert('Reminder is paused');
        }
      } catch (error) {
        console.error('Error canceling notifications:', error);
      }
    } else {
      await scheduleReminder();
    }
    setIsReminderActive(!isReminderActive);
  };

  // Schedule notification based on selected interval
  const scheduleReminder = async (interval?: ReminderInterval) => {
    if (Platform.OS === 'web') {
      return;
    }
    try {
      const intervalToUse = interval || selectedInterval;
      await Notifications.cancelAllScheduledNotificationsAsync();
      const customMinutes = intervalToUse === 'custom' ? reminderMinutes : undefined;
      // Pass userInfo to enable smart scheduling based on wakeUpTime and bedTime
      await startReminder(intervalToUse, userInfo || null, customMinutes);
      const intervalLabel = getIntervalLabel(intervalToUse, customMinutes);
      if (Platform.OS === 'android') {
        ToastAndroid.show(`Nhắc nhở đã được đặt mỗi ${intervalLabel}`, 3000);
      } else {
        alert(`Nhắc nhở đã được đặt mỗi ${intervalLabel}`);
      }
    } catch (error) {
      console.error('Error scheduling reminder:', error);
    }
  };

  const updateInterval = async (newInterval: ReminderInterval) => {
    setSelectedInterval(newInterval);
    if (isReminderActive) {
      await scheduleReminder(newInterval);
    }
  };

  const updateReminderMinutes = async (minutes: number) => {
    try {
      setReminderMinutes(minutes);
      await AsyncStorage.setItem(REMINDER_MINUTES_KEY, minutes.toString());
      // Không tự động đặt nhắc nhở khi chỉ nhập thời gian
    } catch (error) {
      console.error('Error updating reminder minutes:', error);
    }
  };

  // Hàm đặt thời gian nhắc nhở và hiển thị thông báo
  const setReminderTime = async () => {
    if (Platform.OS === 'web') {
      alert('Notifications are not available on web. Please use the mobile app.');
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      // Pass userInfo to enable smart scheduling based on wakeUpTime and bedTime
      await startReminder('custom', userInfo || null, reminderMinutes);
      const intervalLabel = getIntervalLabel('custom', reminderMinutes);
      
      // Hiển thị thông báo "Nhắc nhở đã đặt mỗi XX giờ"
      const message = `Nhắc nhở đã đặt mỗi ${intervalLabel}`;
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, 3000);
      } else {
        alert(message);
      }
      
      setIsReminderActive(true);
      await getAllnoti();
    } catch (error) {
      console.error('Error setting reminder time:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Có lỗi xảy ra khi đặt nhắc nhở', 3000);
      } else {
        alert('Có lỗi xảy ra khi đặt nhắc nhở');
      }
    }
  };

  return {
    isReminderActive,
    toggleReminder,
    selectedInterval,
    updateInterval,
    scheduleReminder,
    reminderMinutes,
    updateReminderMinutes,
    setReminderTime,
  };
};
