import { useEffect, useState } from 'react';
import { Platform, ToastAndroid } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  requestPermissionNotificationReminder,
  startReminder,
  ReminderInterval,
  getIntervalLabel,
} from './util';

export const useDrinkReminder = () => {
  const [isReminderActive, setIsReminderActive] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<ReminderInterval>('2hours');

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
    }
  }, []);

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

  const scheduleReminder = async (interval?: ReminderInterval) => {
    if (Platform.OS === 'web') {
      return;
    }
    try {
      const intervalToUse = interval || selectedInterval;
      await Notifications.cancelAllScheduledNotificationsAsync();
      await startReminder(intervalToUse);
      const intervalLabel = getIntervalLabel(intervalToUse);
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

  return {
    isReminderActive,
    toggleReminder,
    selectedInterval,
    updateInterval,
    scheduleReminder,
  };
};
