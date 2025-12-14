import React, {useState, useMemo, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import {format, startOfMonth, endOfMonth, eachWeekOfInterval, addMonths, subMonths, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, parseISO, isWithinInterval} from 'date-fns';
import {formatedCurrentDate} from '@/util/SiteUtil';
import Feather from '@expo/vector-icons/Feather';
import {CalendarHistoryType} from '@/storage/userinfo/type';
import {COLOR_THEME} from '@/style/ColorTheme';
import {AnimatedCircularProgress} from 'react-native-circular-progress';

type SimpleCalendarProps = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  waterIntakeHistory: CalendarHistoryType[];
  totalDayIntake: number;
};

const SimpleCalendar = ({
  selectedDate,
  setSelectedDate,
  waterIntakeHistory,
  totalDayIntake,
}: SimpleCalendarProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    return startOfMonth(parseISO(selectedDate));
  });
  const [isCollapsed, setIsCollapsed] = useState(true); // Mặc định là cuộn (collapsed)
  const todayDateStr = formatedCurrentDate();
  const todayDate = parseISO(todayDateStr);

  // Cập nhật currentMonth khi selectedDate thay đổi từ bên ngoài (không phải từ chuyển tháng)
  useEffect(() => {
    const newDate = parseISO(selectedDate);
    const newMonth = startOfMonth(newDate);
    // Chỉ cập nhật nếu tháng thay đổi và không phải tháng hiện tại
    if (!isSameMonth(newMonth, currentMonth)) {
      setCurrentMonth(newMonth);
    }
  }, [selectedDate]);

  // Tạo map từ lịch sử để lookup nhanh
  const intakeMap = useMemo(() => {
    const map = new Map<string, number>();
    waterIntakeHistory.forEach(item => {
      map.set(item.date, item.totalAmount);
    });
    return map;
  }, [waterIntakeHistory]);

  // Lấy các tuần trong tháng (6 tuần)
  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    // Bắt đầu từ đầu tuần của tháng
    const weekStart = startOfWeek(monthStart, {weekStartsOn: 1}); // 1 = Thứ 2
    // Kết thúc ở cuối tuần của tháng
    const weekEnd = endOfWeek(monthEnd, {weekStartsOn: 1});
    
    // Tạo 6 tuần
    const allWeeks = eachWeekOfInterval(
      {start: weekStart, end: weekEnd},
      {weekStartsOn: 1}
    );
    
    // Nếu không đủ 6 tuần, thêm tuần nữa
    while (allWeeks.length < 6) {
      const lastWeek = allWeeks[allWeeks.length - 1];
      const nextWeek = new Date(lastWeek);
      nextWeek.setDate(nextWeek.getDate() + 7);
      allWeeks.push(nextWeek);
    }
    
    return allWeeks.slice(0, 6);
  }, [currentMonth]);

  // Lấy các ngày trong mỗi tuần
  const getDaysInWeek = (weekStart: Date) => {
    return eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(weekStart, {weekStartsOn: 1}),
    });
  };

  // Render một tuần
  const renderWeek = (weekStart: Date, weekIndex: number) => {
    const days = getDaysInWeek(weekStart);
    
    return (
      <View key={weekIndex} style={styles.weekRow}>
        {days.map((day, dayIndex) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const amount = intakeMap.get(dateStr) || 0;
          const fillPercentage =
            totalDayIntake > 0
              ? Math.min((amount / totalDayIntake) * 100, 100)
              : 0;
          const isSelected = isSameDay(day, selectedDateObj);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, todayDate);

          return (
            <TouchableOpacity
              key={dayIndex}
              style={styles.dayCell}
              onPress={() => handleDayPress(day)}
              activeOpacity={0.7}>
              <View
                style={[
                  styles.dayContent,
                  !isCurrentMonth && styles.dayOutOfMonth,
                ]}>
                {isSelected && isCurrentMonth ? (
                  // Ngày được chọn: hiển thị background màu xanh tô kín
                  <View style={styles.selectedDayBackground}>
                    <Text
                      style={styles.dayNumberSelected}>
                      {format(day, 'd')}
                    </Text>
                  </View>
                ) : (
                  // Ngày bình thường: hiển thị progress circle
                  <>
                    <AnimatedCircularProgress
                      size={34}
                      width={3}
                      fill={fillPercentage}
                      rotation={210}
                      tintColor={
                        !isCurrentMonth
                          ? '#cccccc'
                          : COLOR_THEME.base.primary
                      }
                      backgroundColor="#efefef"
                    />
                    <View style={styles.dayNumberContainer}>
                      <Text
                        style={[
                          styles.dayNumber,
                          !isCurrentMonth && styles.dayNumberOutOfMonth,
                        ]}>
                        {format(day, 'd')}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Chuyển tuần (khi lịch ở dạng thu gọn)
  const goToNextWeek = () => {
    const selectedDateObj = parseISO(selectedDate);
    const nextWeekDate = addWeeks(selectedDateObj, 1);
    const nextWeekDateStr = format(nextWeekDate, 'yyyy-MM-dd');
    setSelectedDate(nextWeekDateStr);
    // Cập nhật currentMonth nếu tuần mới nằm ngoài tháng hiện tại
    const nextWeekMonth = startOfMonth(nextWeekDate);
    if (!isSameMonth(nextWeekMonth, currentMonth)) {
      setCurrentMonth(nextWeekMonth);
    }
  };

  const goToPreviousWeek = () => {
    const selectedDateObj = parseISO(selectedDate);
    const prevWeekDate = subWeeks(selectedDateObj, 1);
    const prevWeekDateStr = format(prevWeekDate, 'yyyy-MM-dd');
    setSelectedDate(prevWeekDateStr);
    // Cập nhật currentMonth nếu tuần mới nằm ngoài tháng hiện tại
    const prevWeekMonth = startOfMonth(prevWeekDate);
    if (!isSameMonth(prevWeekMonth, currentMonth)) {
      setCurrentMonth(prevWeekMonth);
    }
  };

  // Chuyển tháng - mũi tên phải = tháng sau, mũi tên trái = tháng trước
  const goToNextMonth = () => {
    // Nếu ở dạng thu gọn, chuyển tuần thay vì tháng
    if (isCollapsed) {
      goToNextWeek();
      return;
    }
    
    const nextMonth = startOfMonth(addMonths(currentMonth, 1));
    setCurrentMonth(nextMonth);
    // Cập nhật selectedDate về ngày đầu tiên của tháng mới để đồng bộ
    const firstDayOfNextMonth = format(nextMonth, 'yyyy-MM-dd');
    setSelectedDate(firstDayOfNextMonth);
    // Reset scroll position khi mở rộng
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({y: 0, animated: false});
      }, 50);
    }
  };

  const goToPreviousMonth = () => {
    // Nếu ở dạng thu gọn, chuyển tuần thay vì tháng
    if (isCollapsed) {
      goToPreviousWeek();
      return;
    }
    
    const prevMonth = startOfMonth(subMonths(currentMonth, 1));
    setCurrentMonth(prevMonth);
    // Cập nhật selectedDate về ngày đầu tiên của tháng trước để đồng bộ
    const firstDayOfPrevMonth = format(prevMonth, 'yyyy-MM-dd');
    setSelectedDate(firstDayOfPrevMonth);
    // Reset scroll position khi mở rộng
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({y: 0, animated: false});
      }, 50);
    }
  };

  // Format tháng bằng tiếng Việt
  const formatMonthVietnamese = (date: Date) => {
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    const month = date.getMonth();
    const year = date.getFullYear();
    return `${monthNames[month]} / ${year}`;
  };

  const handleDayPress = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    // Nếu đang mở rộng lịch, tự động cuộn thu nhỏ lại khi chọn ngày
    if (!isCollapsed) {
      setIsCollapsed(true);
    }
  };

  // Tìm tuần chứa ngày được chọn (hoặc hôm nay)
  const findSelectedWeekIndex = useMemo(() => {
    const dateToFind = parseISO(selectedDate);
    for (let i = 0; i < weeks.length; i++) {
      const weekStart = weeks[i];
      const weekEnd = endOfWeek(weekStart, {weekStartsOn: 1});
      if (isWithinInterval(dateToFind, {start: weekStart, end: weekEnd})) {
        return i;
      }
    }
    return 0; // Mặc định là tuần đầu tiên
  }, [weeks, selectedDate]);

  // Toggle thu nhỏ/mở rộng lịch
  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
    
    // Nếu đang mở rộng, scroll đến tuần được chọn
    if (!isCollapsed && scrollViewRef.current) {
      const weekHeight = 55;
      const scrollY = findSelectedWeekIndex * weekHeight;
      
      scrollViewRef.current.scrollTo({
        y: scrollY,
        animated: true,
      });
    }
  };

  // Lọc tuần để hiển thị: nếu collapsed chỉ hiển thị tuần được chọn
  const visibleWeeks = useMemo(() => {
    if (isCollapsed) {
      // Chỉ hiển thị tuần chứa ngày được chọn
      return weeks.filter((weekStart, index) => {
        const weekEnd = endOfWeek(weekStart, {weekStartsOn: 1});
        const selectedDateObj = parseISO(selectedDate);
        return isWithinInterval(selectedDateObj, {start: weekStart, end: weekEnd});
      });
    }
    return weeks;
  }, [weeks, isCollapsed, selectedDate]);

  const monthLabel = formatMonthVietnamese(currentMonth);
  const selectedDateObj = parseISO(selectedDate);

  return (
    <View style={styles.container}>
      {/* Header với tháng/năm và mũi tên */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.arrowButton}>
          <Feather name="chevron-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.arrowButton}>
          <Feather name="chevron-right" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Header các ngày trong tuần */}
      <View style={styles.weekDayHeader}>
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Lịch với các tuần */}
      {isCollapsed ? (
        <View style={styles.calendarScrollCollapsed}>
          {visibleWeeks.map((weekStart, weekIndex) => renderWeek(weekStart, weekIndex))}
        </View>
      ) : (
        <ScrollView 
          ref={scrollViewRef}
          style={styles.calendarScroll}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={false}
          scrollEnabled={true}
          bounces={false}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled">
          {visibleWeeks.map((weekStart, weekIndex) => renderWeek(weekStart, weekIndex))}
        </ScrollView>
      )}
      
      {/* Nút cuộn lịch ở chính giữa cuối lịch */}
      <View style={styles.scrollButtonContainer}>
        <TouchableOpacity
          onPress={toggleCollapse}
          style={styles.scrollButton}
          activeOpacity={0.7}>
          <View style={styles.scrollLine} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SimpleCalendar;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
    flex: 1,
    textAlign: 'center',
  },
  arrowButton: {
    padding: 5,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 15,
  },
  weekDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendarScroll: {
    maxHeight: 350,
  },
  calendarScrollCollapsed: {
    maxHeight: 60,
    overflow: 'hidden',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
    minHeight: 50,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  dayContent: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOutOfMonth: {
    opacity: 0.3,
  },
  dayNumberContainer: {
    position: 'absolute',
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  dayNumberOutOfMonth: {
    color: '#ccc',
  },
  dayNumberSelected: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedDayBackground: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLOR_THEME.base.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 5,
  },
  scrollButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  scrollLine: {
    width: 40,
    height: 4,
    backgroundColor: COLOR_THEME.base.primary,
    borderRadius: 2,
  },
});
