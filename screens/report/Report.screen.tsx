import { StyleSheet, View } from 'react-native';
import React, { useMemo, useState } from 'react';
import ScreenContainer from '@/components/container/ScreenContainer';
import ButtonTabOptions from '@/components/container/ButtonTabOptions';
import { ReportTabOptions } from '@/constants/TabOption';
import {
  calculateIntakePercentage,
  DrinkCompletionYAxis,
  generateYAxisValues,
  getChartData,
  transformToDonutChartData,
} from './util';
import ReportCardComponent from './component/ReportCardComponent';
import DrinkTypeCard from './component/DrinkTypeCard';
import { useAuth } from '@/context/UserAuthContext';
import { ReportFilterType } from './type';
import { maxBy } from 'lodash';
import { isLeapYear } from 'date-fns';
import { useIsFocused } from '@react-navigation/native';
import { ScreenDimension } from '@/constants/Dimensions';

const ReportScreen = () => {
  const { userWaterIntakeHistory, user: userInfo } = useAuth();
  const [selectedFilter, setSelectedFilter] =
    useState<ReportFilterType>('daily');
  const isFocued = useIsFocused();
  const data = useMemo(() => {
    return getChartData(selectedFilter, userWaterIntakeHistory);
  }, [selectedFilter, isFocued]);

  const max = useMemo(() => {
    return maxBy(data, item => item.value)?.value || 0;
  }, [selectedFilter, isFocued]);

  const getYAxisValue = () => {
    if (selectedFilter === 'daily') {
      return generateYAxisValues(0, max, 5);
    }
    if (selectedFilter === 'weekly') {
      // 7 ngày * mục tiêu mỗi ngày
      return generateYAxisValues(0, (userInfo!.dailyGoal || 0) * 7, 5);
    }
    if (selectedFilter === 'monthly') {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      return generateYAxisValues(0, (userInfo!.dailyGoal || 0) * daysInMonth, 5);
    }

    const daysInYear = isLeapYear(new Date()) ? 366 : 365;
    return generateYAxisValues(0, (userInfo!.dailyGoal || 0) * daysInYear, 5);
  };

  return (
    <ScreenContainer headerTitle="Báo cáo">
      <View style={styles.filterContainer}>
        <ButtonTabOptions
          options={ReportTabOptions}
          handleOptionSelect={value =>
            setSelectedFilter(value as ReportFilterType)
          }
          selectedOption={selectedFilter}
          type="secondary"
          buttonWidth={`${100 / 4}%`}
        />
      </View>
      <ReportCardComponent
        data={calculateIntakePercentage(
          data,
          userInfo?.dailyGoal || 0,
          selectedFilter,
        )}
        key={selectedFilter}
        yAxis={DrinkCompletionYAxis}
        title="Hoàn thành uống nước"
      />
      <View style={{ marginTop: ScreenDimension.scale(20) }}>
        <ReportCardComponent
          data={data.map(item => ({
            ...item,
            value: item.value / 1000,
          }))}
          key={selectedFilter}
          yAxis={getYAxisValue()}
          title="Hydrat hóa"
          labelType={'L'}
        />
      </View>
      <View style={{ marginTop: ScreenDimension.scale(20), marginBottom: ScreenDimension.scale(20) }}>
        <DrinkTypeCard
          data={transformToDonutChartData(userWaterIntakeHistory)}
          title="Loại đồ uống"
        />
      </View>
    </ScreenContainer>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  filterContainer: {
    width: '100%',
    paddingVertical: ScreenDimension.scale(10),
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: ScreenDimension.scale(15),
  },
});
