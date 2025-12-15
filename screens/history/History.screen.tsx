import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, ScrollView, TouchableOpacity } from 'react-native';
import React, { useMemo, useState, useContext, useEffect } from 'react';
import Header from '@/components/container/Header';
import { useAuth } from '@/context/UserAuthContext';
import { IntakeHistoryType } from '@/storage/userinfo/type';
import HistoryCard from '../homepage/component/HistoryCard';
import { FontContext } from '@/context/FontThemeContext';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import SimpleCalendar from './component/SimpleCalendar';
import { transformDataInto } from './util';
import { formatedCurrentDate } from '@/util/SiteUtil';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { COLOR_THEME } from '@/style/ColorTheme';
import { ScreenDimension } from '@/constants/Dimensions';

type GroupedHistory = {
  date: string;
  dateLabel: string;
  items: IntakeHistoryType[];
};

const HistoryScreen = () => {
  const { userWaterIntakeHistory, handleHistoryDelete, user } = useAuth();
  const { textTheme } = useContext(FontContext);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const todayDate = useMemo(() => formatedCurrentDate(), []);
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const insets = useSafeAreaInsets();

  // Tự động hiển thị ngày hôm nay khi mở app lần đầu trong ngày mới
  useEffect(() => {
    const currentTodayDate = formatedCurrentDate();
    // Luôn đảm bảo selectedDate là ngày hôm nay khi component mount (khi mở app)
    setSelectedDate(currentTodayDate);
  }, []); // Chỉ chạy một lần khi component mount (khi mở màn hình History)

  const userInfo = user;
  const totalDayIntake = useMemo(() => {
    return userInfo?.dailyGoal || 2000;
  }, [userInfo?.dailyGoal]);

  const transformedWaterIntakeHistory = useMemo(() => {
    return transformDataInto(userWaterIntakeHistory || []);
  }, [userWaterIntakeHistory]);

  // Lọc lịch sử theo ngày được chọn
  const selectedDateHistory = useMemo(() => {
    if (!userWaterIntakeHistory || userWaterIntakeHistory.length === 0) {
      return [];
    }
    return userWaterIntakeHistory.filter(item => item.date === selectedDate);
  }, [userWaterIntakeHistory, selectedDate]);

  // Sắp xếp items theo thời gian (mới nhất trước)
  const sortedSelectedDateHistory = useMemo(() => {
    return [...selectedDateHistory].sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);

      for (let i = 0; i < 3; i++) {
        if (timeB[i] !== timeA[i]) {
          return timeB[i] - timeA[i];
        }
      }
      return 0;
    });
  }, [selectedDateHistory]);

  // Tạo dateLabel cho ngày được chọn
  const selectedDateLabel = useMemo(() => {
    const dateObj = parseISO(selectedDate);
    if (isToday(dateObj)) {
      // Hiển thị "Hôm nay - ngày / tháng / năm"
      return `Hôm nay - ${format(dateObj, 'dd/MM/yyyy')}`;
    } else {
      // Hiển thị "Ngày / tháng / năm"
      return format(dateObj, 'dd/MM/yyyy');
    }
  }, [selectedDate]);

  // Kiểm tra xem có phải đang xem hôm nay không
  const isViewingToday = useMemo(() => {
    return isToday(parseISO(selectedDate));
  }, [selectedDate]);

  // Hàm quay về ngày hôm nay
  const goToToday = () => {
    setSelectedDate(todayDate);
  };

  const handleOutsidePress = () => {
    setOpenMenuId(null);
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Image
          tintColor={'#EEF7FF'}
          source={require('@/assets/images/leaf.png')}
          style={styles.emptyImage}
        />
        <Text style={[textTheme.subText, styles.emptyText]}>
          Bạn chưa có lịch sử uống nước
        </Text>
      </View>
    );
  };

  const renderHistoryList = () => {
    if (sortedSelectedDateHistory.length === 0) {
      return (
        <View style={styles.listContainer}>
          <View style={styles.dateGroup}>
            <View style={styles.dateLabelRow}>
              <Text style={[textTheme.heading3, styles.dateLabel]}>
                {selectedDateLabel}
              </Text>
              {!isViewingToday && (
                <TouchableOpacity
                  onPress={goToToday}
                  style={styles.backToTodayButton}
                  activeOpacity={0.7}>
                  <Feather name="home" size={18} color={COLOR_THEME.base.primary} />
                  <Text style={styles.backToTodayText}>Hôm nay</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.divider} />
            <View style={styles.emptyListContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                <Image
                  tintColor={'#EEF7FF'}
                  source={require('@/assets/images/leaf.png')}
                  style={{
                    height: 100,
                    width: 100,
                    marginBottom: 20,
                  }}
                />
              </View>
              <Text
                style={[textTheme.subText, styles.emptyListText]}
                numberOfLines={1}>
                Không có lịch sử uống nước
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        <View style={styles.dateGroup}>
          <View style={styles.dateLabelRow}>
            <Text style={[textTheme.heading3, styles.dateLabel]}>
              {selectedDateLabel}
            </Text>
            {!isViewingToday && (
              <TouchableOpacity
                onPress={goToToday}
                style={styles.backToTodayButton}
                activeOpacity={0.7}>
                <Feather name="home" size={18} color={COLOR_THEME.base.primary} />
                <Text style={styles.backToTodayText}>Hôm nay</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.divider} />
          <View style={styles.itemsContainer}>
            {sortedSelectedDateHistory.map((item, itemIndex) => (
              <View
                key={item.id}
                style={[
                  styles.itemWrapper,
                  itemIndex === 0 && styles.firstItem,
                  itemIndex === sortedSelectedDateHistory.length - 1 && styles.lastItem,
                ]}>
                <HistoryCard
                  handleHistoryDelete={handleHistoryDelete}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  textTheme={textTheme}
                  intakeInfo={item}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <Header
        title="Lịch sử"
        containerStyling={{
          paddingTop: Math.max(insets.top, 6),
        }}
      />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#F5F5F5',
        }}
        edges={['bottom']}>
        <View style={styles.content}>
          {/* Lớp trên: Lịch - Cố định không cuộn */}
          <View style={styles.calendarLayer}>
            <SimpleCalendar
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              waterIntakeHistory={transformedWaterIntakeHistory}
              totalDayIntake={totalDayIntake}
            />
          </View>

          {/* Lớp dưới: Danh sách lịch sử - Có thể cuộn */}
          <ScrollView
            style={styles.historyLayer}
            contentContainerStyle={styles.historyLayerContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={false}
            bounces={true}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
            alwaysBounceVertical={false}>
            {renderHistoryList()}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F5F5F5',
  },
  calendarLayer: {
    width: '100%',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  historyLayer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F5F5F5',
  },
  historyLayerContent: {
    flexGrow: 1,
    paddingBottom: ScreenDimension.scale(20),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ScreenDimension.horizontalPadding,
  },
  emptyImage: {
    height: 100,
    width: 100,
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: 300,
  },
  emptyListText: {
    textAlign: 'center',
    color: '#999',
  },
  listContainer: {
    width: '100%',
    flex: 1,
    minHeight: '100%',
  },
  dateGroup: {
    width: '100%',
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: ScreenDimension.horizontalPadding,
    paddingTop: 20,
    paddingBottom: ScreenDimension.scale(30),
    minHeight: '100%',
  },
  dateLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  backToTodayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EEF7FF',
  },
  backToTodayText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_THEME.base.primary,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 20,
    marginHorizontal: -ScreenDimension.horizontalPadding,
  },
  itemsContainer: {
    width: '100%',
    paddingBottom: ScreenDimension.scale(20),
  },
  itemWrapper: {
    marginBottom: 10,
    paddingBottom: 10,
  },
  firstItem: {
    marginTop: 0,
  },
  lastItem: {
    marginBottom: 0,
    paddingBottom: 0,
  },
});
