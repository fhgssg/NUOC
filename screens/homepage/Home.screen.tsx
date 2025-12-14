import { StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import ScreenContainer from '@/components/container/ScreenContainer';
import WaterIntakeTracker from './component/WaterIntakeTracker';
import { useAuth } from '@/context/UserAuthContext';
import { ByDefaultCupsOptions } from '@/constants/OptionConstant';
import { formatedCurrentDate } from '@/util/SiteUtil';
import WaterIntakeHistoryToday from './component/WaterIntakeHistoryToday';
import { filterTodayIntakeHistory } from './util';
import { requestPermissionNotificationReminder, scheduleMorningNotification, scheduleBedtimeNotification } from '../drinkReminder/util';
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
  }, [userInfo?.wakeUpTime, userInfo?.bedTime, userInfo?.isCompleted]);

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
    paddingHorizontal: ScreenDimension.horizontalPadding,
  },
  trackerContainer: {
    width: '100%',
  },
  historyContainer: {
    width: '100%',
    marginTop: ScreenDimension.scale(20),
    paddingBottom: ScreenDimension.scale(20),
  },
});
