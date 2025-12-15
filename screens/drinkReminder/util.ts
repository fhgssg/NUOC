import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { UserInfo } from '@/storage/userinfo/type';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const REMINDER_INTERVALS = {
  '30min': 30 * 60,
  '1hour': 60 * 60,
  '2hours': 120 * 60,
  '3hours': 180 * 60,
  'custom': 0, // Placeholder, sẽ được thay thế bởi customMinutes
} as const;

export type ReminderInterval = keyof typeof REMINDER_INTERVALS;

export const getIntervalLabel = (interval: ReminderInterval, customMinutes?: number): string => {
  if (interval === 'custom' && customMinutes !== undefined) {
    if (customMinutes < 60) {
      return `${customMinutes} phút`;
    } else if (customMinutes === 60) {
      return '1 giờ';
    } else {
      const hours = Math.floor(customMinutes / 60);
      const minutes = customMinutes % 60;
      if (minutes === 0) {
        return `${hours} giờ`;
      } else {
        // Hiển thị cả giờ và phút riêng biệt
        return `${hours} giờ ${minutes} phút`;
      }
    }
  }

  const labels: Record<Exclude<ReminderInterval, 'custom'>, string> = {
    '30min': '30 phút',
    '1hour': '1 giờ',
    '2hours': '2 giờ',
    '3hours': '3 giờ',
  };
  return labels[interval as Exclude<ReminderInterval, 'custom'>];
};

// Lấy số giây từ interval (hỗ trợ custom)
export const getIntervalSeconds = (interval: ReminderInterval, customMinutes?: number): number => {
  if (interval === 'custom' && customMinutes !== undefined && customMinutes > 0) {
    return customMinutes * 60;
  }
  return REMINDER_INTERVALS[interval] || 120 * 60; // Default 2 hours
};

// Mảng các thông điệp nhắc nhở chuyên nghiệp và đa dạng
const REMINDER_MESSAGES = [
  {
    title: '💧 Đến giờ uống nước!',
    body: 'Hãy uống nước để duy trì sức khỏe và năng lượng cho cơ thể bạn.',
  },
  {
    title: '⏰ Nhắc nhở uống nước',
    body: 'Cơ thể bạn cần được bổ sung nước. Hãy uống một ly nước ngay nhé!',
  },
  {
    title: '🚰 Giữ cơ thể đủ nước',
    body: 'Uống nước đều đặn giúp cơ thể hoạt động tốt hơn. Đã đến lúc bổ sung nước rồi!',
  },
  {
    title: '💪 Nạp năng lượng',
    body: 'Nước là nguồn năng lượng tự nhiên. Hãy uống nước để duy trì sự tập trung.',
  },
  {
    title: '🌊 Nhắc nhở uống nước',
    body: 'Đã đến lúc bổ sung nước cho cơ thể. Hãy uống một ly nước để cảm thấy sảng khoái hơn!',
  },
  {
    title: '✨ Chăm sóc sức khỏe',
    body: 'Uống nước đều đặn là cách đơn giản nhất để chăm sóc sức khỏe. Hãy uống ngay nhé!',
  },
];

// Lấy thông điệp ngẫu nhiên dựa trên thời gian trong ngày
const getReminderMessage = (hour: number): { title: string; body: string } => {
  let messageIndex = 0;

  // Chọn thông điệp dựa trên thời gian trong ngày để đa dạng hơn
  if (hour >= 6 && hour < 9) {
    // Buổi sáng sớm
    messageIndex = 0;
  } else if (hour >= 9 && hour < 12) {
    // Buổi sáng
    messageIndex = 1;
  } else if (hour >= 12 && hour < 15) {
    // Buổi trưa
    messageIndex = 2;
  } else if (hour >= 15 && hour < 18) {
    // Buổi chiều
    messageIndex = 3;
  } else if (hour >= 18 && hour < 21) {
    // Buổi tối
    messageIndex = 4;
  } else {
    // Tối muộn
    messageIndex = 5;
  }

  return REMINDER_MESSAGES[messageIndex];
};

// Tính toán thời gian hoạt động trong ngày (từ wakeUpTime đến bedTime)
const calculateActiveHours = (wakeUpTime: string, bedTime: string): number => {
  const [wakeHour, wakeMin] = wakeUpTime.split(':').map(Number);
  const [bedHour, bedMin] = bedTime.split(':').map(Number);

  let wakeMinutes = wakeHour * 60 + wakeMin;
  let bedMinutes = bedHour * 60 + bedMin;

  // Xử lý trường hợp bedTime qua đêm (ví dụ: 23:00 đến 07:00)
  if (bedMinutes < wakeMinutes) {
    bedMinutes += 24 * 60;
  }

  return (bedMinutes - wakeMinutes) / 60; // Trả về số giờ
};

// Tạo lịch trình nhắc nhở thông minh dựa trên giờ thức dậy và đi ngủ
const createSmartSchedule = (
  interval: ReminderInterval,
  wakeUpTime: string,
  bedTime: string,
  customMinutes?: number,
): Date[] => {
  const [wakeHour, wakeMin] = wakeUpTime.split(':').map(Number);
  const [bedHour, bedMin] = bedTime.split(':').map(Number);

  const intervalSeconds = getIntervalSeconds(interval, customMinutes);
  const intervalMinutes = intervalSeconds / 60;
  const activeHours = calculateActiveHours(wakeUpTime, bedTime);
  const remindersPerDay = Math.max(1, Math.floor((activeHours * 60) / intervalMinutes));

  const schedule: Date[] = [];
  const now = new Date();

  // Tính toán thời gian wake và bed dưới dạng phút
  const wakeTotalMinutes = wakeHour * 60 + wakeMin;
  const bedTotalMinutes = bedHour * 60 + bedMin;
  const bedTotalMinutesNextDay = bedTotalMinutes < wakeTotalMinutes
    ? bedTotalMinutes + 24 * 60
    : bedTotalMinutes;

  // Tạo lịch cho 3 ngày tiếp theo (giảm từ 7 để tránh vượt quá giới hạn 500 thông báo)
  const MAX_DAYS = 3;
  const MAX_NOTIFICATIONS = 150; // Giới hạn tổng số thông báo

  for (let day = 0; day < MAX_DAYS && schedule.length < MAX_NOTIFICATIONS; day++) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + day);
    targetDate.setHours(wakeHour, wakeMin, 0, 0);

    // Thêm các nhắc nhở trong ngày
    for (let i = 0; i < remindersPerDay && schedule.length < MAX_NOTIFICATIONS; i++) {
      const reminderTime = new Date(targetDate);
      reminderTime.setMinutes(reminderTime.getMinutes() + i * intervalMinutes);

      // Kiểm tra xem thời gian có nằm trong khoảng active hours không
      const reminderHour = reminderTime.getHours();
      const reminderMin = reminderTime.getMinutes();
      const reminderTotalMinutes = reminderHour * 60 + reminderMin;

      // Tính toán thời gian bed cho ngày hiện tại
      // Nếu bedTime < wakeUpTime, nghĩa là bedTime qua đêm (ví dụ: 23:00 đến 07:00)
      let isWithinActiveHours: boolean;
      if (bedTotalMinutes < wakeTotalMinutes) {
        // BedTime qua đêm: active hours từ wakeUpTime đến bedTime của ngày hôm sau
        // Reminder hợp lệ nếu: reminder >= wakeUpTime HOẶC reminder < bedTime
        isWithinActiveHours = 
          reminderTotalMinutes >= wakeTotalMinutes || 
          reminderTotalMinutes < bedTotalMinutes;
      } else {
        // BedTime cùng ngày: active hours từ wakeUpTime đến bedTime
        isWithinActiveHours = 
          reminderTotalMinutes >= wakeTotalMinutes && 
          reminderTotalMinutes < bedTotalMinutes;
      }

      if (isWithinActiveHours && reminderTime > now && schedule.length < MAX_NOTIFICATIONS) {
        schedule.push(reminderTime);
      }
    }
  }

  return schedule;
};

export const startReminder = async (
  interval: ReminderInterval = '2hours',
  userInfo?: UserInfo | null,
  customMinutes?: number,
) => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    // Hủy tất cả các nhắc nhở cũ
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of allNotifications) {
      if (
        notification.identifier.startsWith('drink-reminder-') ||
        notification.content.data?.type === 'drink-reminder'
      ) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    const intervalLabel = getIntervalLabel(interval);

    // Nếu có thông tin người dùng, sử dụng lịch trình thông minh
    if (userInfo?.wakeUpTime && userInfo?.bedTime) {
      const schedule = createSmartSchedule(
        interval,
        userInfo.wakeUpTime,
        userInfo.bedTime,
        customMinutes,
      );

      // Lên lịch từng nhắc nhở (giới hạn để tránh vượt quá 500)
      const MAX_SCHEDULE = 100; // Giới hạn số thông báo được lên lịch một lần
      let scheduledCount = 0;

      for (let i = 0; i < schedule.length && scheduledCount < MAX_SCHEDULE; i++) {
        const reminderTime = schedule[i];
        const reminderHour = reminderTime.getHours();
        const message = getReminderMessage(reminderHour);

        // Sử dụng TIME_INTERVAL cho cả hai nền tảng
        const secondsUntilReminder = Math.floor(
          (reminderTime.getTime() - new Date().getTime()) / 1000,
        );

        if (secondsUntilReminder > 0) {
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: message.title,
                body: message.body,
                sound: true,
                vibrate: [2],
                data: {
                  type: 'drink-reminder',
                  interval: interval,
                },
              },
              trigger: {
                type: SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: secondsUntilReminder,
                repeats: false,
              },
              identifier: `drink-reminder-${interval}-${i}-${reminderTime.getTime()}`,
            });
            scheduledCount++;
          } catch (error) {
            console.error(`Error scheduling notification ${i}:`, error);
            // Nếu gặp lỗi giới hạn, dừng lại
            if (error instanceof Error && error.message.includes('Maximum limit')) {
              console.warn('Reached notification limit, stopping scheduling');
              break;
            }
          }
        }
      }

      if (scheduledCount > 0) {
        console.log(`Scheduled ${scheduledCount} drink reminder notifications`);
      }
    } else {
      // Fallback: sử dụng phương pháp cũ nếu không có thông tin người dùng
      const seconds = getIntervalSeconds(interval, customMinutes);
      const now = new Date();
      const message = getReminderMessage(now.getHours());

      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
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
    }
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

    // Cancel all existing bedtime notifications to avoid duplicates
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of allNotifications) {
      if (
        notification.identifier.startsWith('bedtime-water-reminder') ||
        notification.content.data?.type === 'bedtime-reminder'
      ) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

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

    // Cancel all existing morning notifications to avoid duplicates
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of allNotifications) {
      if (
        notification.identifier.startsWith('morning-water-goal') ||
        notification.content.data?.type === 'morning-goal'
      ) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(hours || 7, minutes || 0, 0, 0);

    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const secondsUntilTarget = Math.floor((targetTime.getTime() - now.getTime()) / 1000);

    if (Platform.OS === 'android') {
      // Already cancelled above

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

      // Cancel all drink reminders (periodic reminders)
      if (
        notificationData?.type === 'drink-reminder' ||
        identifier.startsWith('drink-reminder-')
      ) {
        await Notifications.cancelScheduledNotificationAsync(identifier);
        continue;
      }

      // Cancel all bedtime reminders (both Android day-0 to day-7 and iOS)
      if (
        notificationData?.type === 'bedtime-reminder' ||
        identifier.startsWith('bedtime-water-reminder')
      ) {
        await Notifications.cancelScheduledNotificationAsync(identifier);
        continue;
      }

      // Cancel morning goal notifications when goal is reached
      // (User already achieved goal, no need for morning reminder)
      if (
        notificationData?.type === 'morning-goal' ||
        identifier.startsWith('morning-water-goal')
      ) {
        await Notifications.cancelScheduledNotificationAsync(identifier);
      }
    }
  } catch (error) {
    console.error('Error cancelling reminder notifications:', error);
  }
};

// Clear goal achieved flag when intake drops below 95% of goal
export const clearGoalAchievedFlag = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const goalAchievedKey = `@water_mate:goal_achieved_${today}`;
    await AsyncStorage.removeItem(goalAchievedKey);
  } catch (error) {
    console.error('Error clearing goal achieved flag:', error);
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
      // Check if we already sent a goal achieved notification today using AsyncStorage
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const goalAchievedKey = `@water_mate:goal_achieved_${today}`;
      const hasGoalAchievedToday = await AsyncStorage.getItem(goalAchievedKey);

      // Only send if we haven't sent one today
      if (!hasGoalAchievedToday) {
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

        // Mark as sent today
        await AsyncStorage.setItem(goalAchievedKey, 'true');
      }
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
