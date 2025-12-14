import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { UserInfo } from '@/storage/userinfo/type';

export const REMINDER_INTERVALS = {
  '30min': 30 * 60,
  '1hour': 60 * 60,
  '2hours': 60 * 60 * 2,
  '3hours': 60 * 60 * 3,
} as const;

export type ReminderInterval = keyof typeof REMINDER_INTERVALS;

export const getIntervalLabel = (interval: ReminderInterval): string => {
  const labels: Record<ReminderInterval, string> = {
    '30min': '30 phút',
    '1hour': '1 giờ',
    '2hours': '2 giờ',
    '3hours': '3 giờ',
  };
  return labels[interval];
};

export const startReminder = async (interval: ReminderInterval = '2hours') => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const seconds = REMINDER_INTERVALS[interval];
    const intervalLabel = getIntervalLabel(interval);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Đến giờ uống nước!',
        body: `Hãy uống nước để giữ cơ thể luôn khỏe mạnh! (Nhắc nhở mỗi ${intervalLabel})`,
        sound: true,
        vibrate: [2],
        data: {
          type: 'drink-reminder',
          interval: interval,
        },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: seconds,
        repeats: true,
      },
      identifier: `drink-reminder-${interval}`,
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

export const requestPermissionNotificationReminder = async () => {
  if (Platform.OS === 'web') {
    return { status: 'denied' as const };
  }

  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return {
      status,
    };
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return { status: 'denied' as const };
  }
};

export const scheduleBedtimeNotification = async (
  userInfo: UserInfo,
): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const [hours, minutes] = (userInfo.bedTime || '23:00').split(':').map(Number);

    await Notifications.cancelScheduledNotificationAsync('bedtime-water-reminder');

    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(hours || 23, minutes || 0, 0, 0);

    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const secondsUntilTarget = Math.floor((targetTime.getTime() - now.getTime()) / 1000);

    if (Platform.OS === 'android') {
      for (let day = 0; day <= 7; day++) {
        const nextDayTime = new Date(targetTime);
        nextDayTime.setDate(nextDayTime.getDate() + day);
        const secondsUntilNextDay = Math.floor((nextDayTime.getTime() - now.getTime()) / 1000);

        if (secondsUntilNextDay > 0) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '🌙 Đến giờ đi ngủ',
              body: 'Nhớ uống một ly nước trước khi đi ngủ để giữ cơ thể đủ nước nhé!',
              sound: true,
              vibrate: [2],
              data: {
                type: 'bedtime-reminder',
                userId: userInfo.userId,
                bedTime: userInfo.bedTime,
              },
            },
            trigger: {
              type: SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: secondsUntilNextDay,
              repeats: false,
            },
            identifier: `bedtime-water-reminder-day-${day}`,
          });
        }
      }
    } else {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌙 Đến giờ đi ngủ',
          body: 'Nhớ uống một ly nước trước khi đi ngủ để giữ cơ thể đủ nước nhé!',
          sound: true,
          vibrate: [2],
          data: {
            type: 'bedtime-reminder',
            userId: userInfo.userId,
          },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.CALENDAR,
          hour: hours || 23,
          minute: minutes || 0,
          repeats: true,
        },
        identifier: 'bedtime-water-reminder',
      });
    }
  } catch (error) {
    console.error('Error scheduling bedtime notification:', error);
  }
};

export const scheduleMorningNotification = async (
  userInfo: UserInfo,
): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const [hours, minutes] = userInfo.wakeUpTime.split(':').map(Number);

    const baseGoal = userInfo.dailyGoal || 2000;

    await Notifications.cancelScheduledNotificationAsync('morning-water-goal');

    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(hours || 7, minutes || 0, 0, 0);

    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const secondsUntilTarget = Math.floor((targetTime.getTime() - now.getTime()) / 1000);

    if (Platform.OS === 'android') {
      await Notifications.cancelScheduledNotificationAsync('morning-water-goal-repeat');

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Mục Tiêu Uống Nước Hôm Nay',
          body: `Mục tiêu hôm nay của bạn là ${baseGoal}ml. Hãy bắt đầu ngày mới với một ly nước nhé!`,
          sound: true,
          vibrate: [2],
          data: {
            type: 'morning-goal',
            baseGoal: baseGoal,
            userId: userInfo.userId,
            wakeUpTime: userInfo.wakeUpTime,
          },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntilTarget,
          repeats: false,
        },
        identifier: 'morning-water-goal',
      });

      for (let day = 1; day <= 7; day++) {
        const nextDayTime = new Date(targetTime);
        nextDayTime.setDate(nextDayTime.getDate() + day);
        const secondsUntilNextDay = Math.floor((nextDayTime.getTime() - now.getTime()) / 1000);

        if (secondsUntilNextDay > 0) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Mục Tiêu Uống Nước Hôm Nay',
              body: `Mục tiêu hôm nay của bạn là ${baseGoal}ml. Hãy bắt đầu ngày mới với một ly nước nhé!`,
              sound: true,
              vibrate: [2],
              data: {
                type: 'morning-goal',
                baseGoal: baseGoal,
                userId: userInfo.userId,
                wakeUpTime: userInfo.wakeUpTime,
              },
            },
            trigger: {
              type: SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: secondsUntilNextDay,
              repeats: false,
            },
            identifier: `morning-water-goal-day-${day}`,
          });
        }
      }
    } else {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Mục Tiêu Uống Nước Hôm Nay',
          body: `Mục tiêu hôm nay của bạn là ${baseGoal}ml. Hãy bắt đầu ngày mới với một ly nước nhé!`,
          sound: true,
          vibrate: [2],
          data: {
            type: 'morning-goal',
            baseGoal: baseGoal,
            userId: userInfo.userId,
          },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.CALENDAR,
          hour: hours || 7,
          minute: minutes || 0,
          repeats: true,
        },
        identifier: 'morning-water-goal',
      });
    }
  } catch (error) {
    console.error('Error scheduling morning notification:', error);
  }
};

export const cancelReminderNotificationsWhenGoalReached = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of allNotifications) {
      const notificationData = notification.content.data;
      const identifier = notification.identifier;

      if (
        notificationData?.type === 'drink-reminder' ||
        identifier.startsWith('drink-reminder-')
      ) {
        await Notifications.cancelScheduledNotificationAsync(identifier);
        continue;
      }

      if (
        notificationData?.type === 'bedtime-reminder' ||
        identifier.startsWith('bedtime-water-reminder')
      ) {
        if (Platform.OS === 'android' && identifier === 'bedtime-water-reminder-day-0') {
          await Notifications.cancelScheduledNotificationAsync(identifier);
        }
        else if (Platform.OS === 'ios' && identifier === 'bedtime-water-reminder') {
          await Notifications.cancelScheduledNotificationAsync(identifier);
        }
      }
    }
  } catch (error) {
    console.error('Error cancelling reminder notifications:', error);
  }
};

export const sendGoalAchievedNotification = async (
  dailyGoal: number,
  currentIntake: number,
): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    if (currentIntake >= dailyGoal * 0.95) {
      await cancelReminderNotificationsWhenGoalReached();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Chúc mừng!',
          body: `Bạn đã đạt mục tiêu uống nước hôm nay! (${Math.round(currentIntake)}ml / ${dailyGoal}ml)`,
          sound: true,
          vibrate: [3],
          data: {
            type: 'goal-achieved',
            goal: dailyGoal,
            intake: currentIntake,
          },
        },
        trigger: null,
        identifier: `goal-achieved-${Date.now()}`,
      });
    }
  } catch (error) {
    console.error('Error sending goal achieved notification:', error);
  }
};

export const sendSmartReminderNotification = async (
  lastDrinkTime: Date | null,
  dailyGoal: number,
  currentIntake: number,
): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const now = new Date();
    const hoursSinceLastDrink = lastDrinkTime
      ? (now.getTime() - lastDrinkTime.getTime()) / (1000 * 60 * 60)
      : 999;

    if (currentIntake >= dailyGoal * 0.95) {
      return;
    }

    if (hoursSinceLastDrink >= 3 && currentIntake < dailyGoal * 0.5) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Nhắc nhở uống nước',
          body: `Bạn đã ${Math.round(hoursSinceLastDrink)} giờ chưa uống nước. Hãy uống ngay để đạt mục tiêu!`,
          sound: true,
          vibrate: [2],
          data: {
            type: 'smart-reminder',
            hoursSinceLastDrink: hoursSinceLastDrink,
          },
        },
        trigger: null,
        identifier: `smart-reminder-${Date.now()}`,
      });
    }
  } catch (error) {
    console.error('Error sending smart reminder notification:', error);
  }
};
