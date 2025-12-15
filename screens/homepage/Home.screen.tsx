import { StyleSheet, View, Platform } from 'react-native';
import React, { useEffect } from 'react';
import ScreenContainer from '@/components/container/ScreenContainer';
import WaterIntakeTracker from './component/WaterIntakeTracker';
import { useAuth } from '@/context/UserAuthContext';
import { ByDefaultCupsOptions } from '@/constants/OptionConstant';
import { formatedCurrentDate } from '@/util/SiteUtil';
import WaterIntakeHistoryToday from './component/WaterIntakeHistoryToday';
import { filterTodayIntakeHistory } from './util';
import { requestPermissionNotificationReminder, scheduleMorningNotification, scheduleBedtimeNotification, sendSmartReminderNotification } from '../drinkReminder/util';
import { ScreenDimension } from '@/constants/Dimensions';

const HomeScreen = () => {
  const {
    user: userInfo,
    updateUserInfo,
    handleHistoryDelete,
    userWaterIntakeHistory,
    addWaterLog,
  } = useAuth();

  useEffect(() => {
    requestPermissionNotificationReminder();

    if (userInfo?.isCompleted && userInfo?.wakeUpTime) {
      scheduleMorningNotification(userInfo).catch(error => {
        console.error('Error scheduling morning notification:', error);
      });
    }
    if (userInfo?.isCompleted && userInfo?.bedTime) {
      scheduleBedtimeNotification(userInfo).catch(error => {
        console.error('Error scheduling bedtime notification:', error);
      });
    }

    // Cleanup: Cancel notifications when component unmounts or dependencies change
    return () => {
      // Note: scheduleMorningNotification and scheduleBedtimeNotification 
      // already cancel old notifications before scheduling new ones
      // This cleanup is mainly for when component unmounts
    };
  }, [userInfo?.wakeUpTime, userInfo?.bedTime, userInfo?.isCompleted]);

  // Check for smart reminder notification (when user hasn't drunk water for 3+ hours)
  useEffect(() => {
    if (!userInfo?.isCompleted || Platform.OS === 'web') return;

    const checkSmartReminder = () => {
      // Get the most recent drink log from today
      const today = formatedCurrentDate();
      const todayHistory = filterTodayIntakeHistory(userWaterIntakeHistory, today);
      
      let lastDrinkTime: Date | null = null;
      if (todayHistory.length > 0) {
        // Get the most recent log (first item in sorted descending order)
        const mostRecentLog = todayHistory[0];
        if (mostRecentLog.date === today && mostRecentLog.time) {
          const [hours, minutes, seconds] = mostRecentLog.time.split(':').map(Number);
          const logDate = new Date();
          logDate.setHours(hours, minutes, seconds || 0, 0);
          lastDrinkTime = logDate;
        }
      }

      const dailyGoal = userInfo.dailyGoal || 2000;
      const currentIntake = userInfo.dailyIntake || 0;

      sendSmartReminderNotification(lastDrinkTime, dailyGoal, currentIntake).catch(error => {
        console.error('Error sending smart reminder notification:', error);
      });
    };

    // Check immediately
    checkSmartReminder();

    // Check every hour
    const interval = setInterval(checkSmartReminder, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userInfo, userWaterIntakeHistory]);

  return (
    <ScreenContainer headerTitle="Trang chủ">
      <View style={styles.content}>
        <View style={styles.trackerContainer}>
          <WaterIntakeTracker
            todayIntack={{
              date: formatedCurrentDate(),
              value: userInfo?.dailyIntake || 0,
            }}
            totalIntack={{
              type: 'ml',
              value: userInfo?.dailyGoal || 0,
            }}
            handleUpdateSelectCup={cupDetail => {
              try {
                if (cupDetail.id <= 10) {
                  updateUserInfo(cupDetail.value, 'cupSize');
                }
              } catch (error) {
                console.error('Error in handleUpdateSelectCup:', error);
                throw error;
              }
            }}
            updateTodayDrinkingTrack={async (todayIntack) => {
              const drinkType = todayIntack.drinkType || 'water';
              const defaultCupId = todayIntack.defaultCupId;
              await addWaterLog(todayIntack.value, drinkType, defaultCupId);
            }}
            defaultSelectedCup={
              ByDefaultCupsOptions.find(cup => cup.value === (userInfo?.cupSize || 200)) || ByDefaultCupsOptions[3]
            }
          />
        </View>
        <View style={styles.historyContainer}>
          <WaterIntakeHistoryToday
            handleHistoryDelete={handleHistoryDelete}
            todayHistoryList={filterTodayIntakeHistory(
              userWaterIntakeHistory,
              formatedCurrentDate(),
            )}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 0,
  },
  trackerContainer: {
    width: '100%',
  },
  historyContainer: {
    flex: 1,
    width: '100%',
    marginTop: ScreenDimension.scale(20),
  },
});
