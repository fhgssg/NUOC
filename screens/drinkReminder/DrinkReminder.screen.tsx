import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, Animated, TouchableOpacity } from 'react-native';
import { COLOR_THEME } from '@/style/ColorTheme';
import { useDrinkReminder } from './hook';
import { FontAwesome } from '@expo/vector-icons';
import { ScreenDimension } from '@/constants/Dimensions';
import ScreenContainer from '@/components/container/ScreenContainer';

const DrinkReminder = () => {
  const {
    isReminderActive,
    toggleReminder,
    reminderMinutes,
    updateReminderMinutes,
    setReminderTime,
  } = useDrinkReminder();

  const [localHours, setLocalHours] = useState('0');
  const [localMinutes, setLocalMinutes] = useState(
    reminderMinutes ? reminderMinutes.toString() : '00'
  );
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const MIN_MINUTES = 1;
  const MAX_HOURS = 23;
  const MAX_MINUTES_PER_HOUR = 59;

  useEffect(() => {
    if (reminderMinutes === undefined || reminderMinutes === null) {
      return;
    }
    const total = reminderMinutes;
    if (total >= MIN_MINUTES) {
      const hours = Math.floor(total / 60);
      const mins = total % 60;
      const finalHours = Math.min(hours, MAX_HOURS);
      setLocalHours(finalHours.toString().padStart(2, '0'));
      setLocalMinutes(mins.toString().padStart(2, '0'));
    } else {
      setLocalHours('00');
      setLocalMinutes(MIN_MINUTES.toString().padStart(2, '0'));
    }
  }, [reminderMinutes]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [localHours, localMinutes]);

  const formatTime = (hours: number, minutes: number): string => {
    return `${hours} giờ ${minutes} phút`;
  };

  const getDisplayHours = (): number => {
    const hoursNum = parseInt(localHours, 10);
    return isNaN(hoursNum) ? 0 : hoursNum;
  };

  const getDisplayMinutes = (): number => {
    const minutesNum = parseInt(localMinutes, 10);
    return isNaN(minutesNum) ? 0 : minutesNum;
  };

  const handleHoursChange = (text: string) => {
    // Chỉ cho phép nhập số
    const numericValue = text.replace(/[^0-9]/g, '');
    // Nếu nhập số mới và giá trị hiện tại đã có 2 chữ số, thay thế bằng số mới
    if (localHours.length === 2 && numericValue.length === 1) {
      setLocalHours(numericValue);
    } else {
      // Giới hạn tối đa 2 chữ số
      setLocalHours(numericValue.slice(0, 2));
    }
  };

  const handleMinutesChange = (text: string) => {
    // Chỉ cho phép nhập số
    const numericValue = text.replace(/[^0-9]/g, '');
    // Nếu nhập số mới và giá trị hiện tại đã có 2 chữ số, thay thế bằng số mới
    if (localMinutes.length === 2 && numericValue.length === 1) {
      setLocalMinutes(numericValue);
    } else {
      // Giới hạn tối đa 2 chữ số
      setLocalMinutes(numericValue.slice(0, 2));
    }
  };

  const calculateAndUpdate = (hours: string, minutes: string) => {
    let hoursNum = parseInt(hours, 10) || 0;
    let minutesNum = parseInt(minutes, 10) || 0;

    // Validate giờ: 0-23
    if (hoursNum > MAX_HOURS) {
      hoursNum = MAX_HOURS;
      setLocalHours(MAX_HOURS.toString().padStart(2, '0'));
    } else if (hoursNum < 0) {
      hoursNum = 0;
      setLocalHours('00');
    }

    // Validate phút: 0-59
    if (minutesNum > MAX_MINUTES_PER_HOUR) {
      minutesNum = MAX_MINUTES_PER_HOUR;
      setLocalMinutes(MAX_MINUTES_PER_HOUR.toString().padStart(2, '0'));
    } else if (minutesNum < 0) {
      minutesNum = 0;
      setLocalMinutes('00');
    }

    // Tính tổng phút
    let totalMinutes = hoursNum * 60 + minutesNum;

    // Tối thiểu 1 phút
    if (totalMinutes < MIN_MINUTES || (hoursNum === 0 && minutesNum === 0)) {
      totalMinutes = MIN_MINUTES;
      setLocalHours('00');
      setLocalMinutes(MIN_MINUTES.toString().padStart(2, '0'));
    }

    updateReminderMinutes(totalMinutes);
  };

  const handleHoursBlur = () => {
    let hoursValue = localHours.trim();
    const hoursNum = parseInt(hoursValue, 10);

    // Nếu rỗng hoặc không hợp lệ, set về 00
    if (hoursValue === '' || isNaN(hoursNum)) {
      hoursValue = '00';
      setLocalHours('00');
    }

    const finalHoursNum = parseInt(hoursValue, 10) || 0;

    // Validate giờ: 0-23
    if (finalHoursNum > MAX_HOURS) {
      setLocalHours(MAX_HOURS.toString().padStart(2, '0'));
    } else if (finalHoursNum < 0) {
      setLocalHours('00');
    } else {
      // Format về 2 chữ số
      setLocalHours(finalHoursNum.toString().padStart(2, '0'));
    }
    calculateAndUpdate(localHours || '00', localMinutes);
  };

  const handleMinutesBlur = () => {
    let minutesValue = localMinutes.trim();
    const minutesNum = parseInt(minutesValue, 10);

    // Nếu rỗng hoặc không hợp lệ, set về giá trị tối thiểu
    if (minutesValue === '' || isNaN(minutesNum)) {
      minutesValue = MIN_MINUTES.toString().padStart(2, '0');
      setLocalMinutes(MIN_MINUTES.toString().padStart(2, '0'));
    }

    const finalMinutesNum = parseInt(minutesValue, 10) || MIN_MINUTES;

    // Validate phút: 0-59
    if (finalMinutesNum < 0) {
      setLocalMinutes('00');
    } else if (finalMinutesNum > MAX_MINUTES_PER_HOUR) {
      setLocalMinutes(MAX_MINUTES_PER_HOUR.toString().padStart(2, '0'));
    } else {
      // Format về 2 chữ số
      setLocalMinutes(finalMinutesNum.toString().padStart(2, '0'));
    }

    calculateAndUpdate(localHours || '00', localMinutes || MIN_MINUTES.toString().padStart(2, '0'));
  };

  return (
    <ScreenContainer headerTitle="Nhắc nhở uống nước" showBackButton={true} disableScroll={true}>
      <View style={styles.content}>
        {/* Reminder Switch */}
        <View style={styles.settingContainer}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Bật nhắc nhở</Text>
              <Text style={styles.settingSubtext}>
                Nhận thông báo nhắc nhở uống nước định kỳ
              </Text>
            </View>
            <Switch
              value={isReminderActive}
              onValueChange={toggleReminder}
              trackColor={{ false: '#ccc', true: COLOR_THEME.base.primary }}
              thumbColor={isReminderActive ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Frequency Selection */}
        {isReminderActive && (
          <View style={styles.settingContainer}>
            <View style={styles.headerSection}>
              <FontAwesome name="clock-o" size={24} color={COLOR_THEME.base.primary} />
              <View style={styles.headerTextContainer}>
                <Text style={styles.sectionTitle}>Tần suất nhắc nhở</Text>
              </View>
            </View>

            {/* Preview Card */}
            <Animated.View
              style={[
                styles.previewCard,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}>
              <View style={styles.previewContent}>
                <FontAwesome name="tint" size={32} color={COLOR_THEME.base.primary} />
                <Text style={styles.previewTime}>
                  {formatTime(getDisplayHours(), getDisplayMinutes())}
                </Text>
              </View>
            </Animated.View>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nhập thời gian</Text>
              <View style={styles.timeInputRow}>
                {/* Hours Input */}
                <View style={styles.timeInputWrapper}>
                  <Text style={styles.timeInputLabel}>Giờ</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={localHours}
                      onChangeText={handleHoursChange}
                      onBlur={handleHoursBlur}
                      keyboardType="number-pad"
                      placeholder="00"
                      placeholderTextColor="#999"
                      maxLength={2}
                      selectTextOnFocus={true}
                    />
                  </View>
                </View>

                {/* Separator */}
                <View style={styles.separator}>
                  <Text style={styles.separatorText}>:</Text>
                </View>

                {/* Minutes Input */}
                <View style={styles.timeInputWrapper}>
                  <Text style={styles.timeInputLabel}>Phút</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={localMinutes}
                      onChangeText={handleMinutesChange}
                      onBlur={handleMinutesBlur}
                      keyboardType="number-pad"
                      placeholder="00"
                      placeholderTextColor="#999"
                      maxLength={2}
                      selectTextOnFocus={true}
                    />
                  </View>
                </View>
              </View>

              {/* Set Time Button */}
              <TouchableOpacity
                style={styles.setTimeButton}
                onPress={setReminderTime}
                activeOpacity={0.8}>
                <Text style={styles.setTimeButtonText}>Đặt thời gian</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome name="info-circle" size={18} color="#2196F3" />
            </View>
            <Text style={styles.infoText}>
              Thông báo sẽ hoạt động ngay cả khi app đóng
            </Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome name="trophy" size={18} color="#FF9800" />
            </View>
            <Text style={styles.infoText}>
              Bạn sẽ nhận thông báo khi đạt mục tiêu uống nước
            </Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome name="lightbulb-o" size={18} color="#9C27B0" />
            </View>
            <Text style={styles.infoText}>
              Hệ thống sẽ nhắc nhở thông minh nếu bạn quên uống nước
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default DrinkReminder;

const styles = StyleSheet.create({
  content: {
    padding: ScreenDimension.horizontalPadding,
    paddingTop: ScreenDimension.scale(20),
  },
  settingContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: ScreenDimension.scale(20),
    marginBottom: ScreenDimension.scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: ScreenDimension.scale(15),
  },
  settingText: {
    fontSize: ScreenDimension.fontScale(18),
    fontWeight: '600',
    color: '#333',
    marginBottom: ScreenDimension.scale(4),
  },
  settingSubtext: {
    fontSize: ScreenDimension.fontScale(13),
    color: '#888',
    lineHeight: ScreenDimension.scale(18),
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ScreenDimension.scale(20),
  },
  headerTextContainer: {
    marginLeft: ScreenDimension.scale(12),
    flex: 1,
  },
  sectionTitle: {
    fontSize: ScreenDimension.fontScale(20),
    fontWeight: '700',
    color: '#333',
    marginBottom: ScreenDimension.scale(4),
  },
  sectionSubtitle: {
    fontSize: ScreenDimension.fontScale(13),
    color: '#888',
    lineHeight: ScreenDimension.scale(18),
  },
  previewCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: ScreenDimension.scale(20),
    marginBottom: ScreenDimension.scale(16),
    borderWidth: 2,
    borderColor: COLOR_THEME.base.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTime: {
    fontSize: ScreenDimension.fontScale(28),
    fontWeight: '700',
    color: COLOR_THEME.base.primary,
    marginTop: ScreenDimension.scale(8),
  },
  inputContainer: {
    marginBottom: ScreenDimension.scale(20),
  },
  inputLabel: {
    fontSize: ScreenDimension.fontScale(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: ScreenDimension.scale(12),
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: ScreenDimension.scale(12),
  },
  timeInputWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  timeInputLabel: {
    fontSize: ScreenDimension.fontScale(14),
    fontWeight: '600',
    color: '#666',
    marginBottom: ScreenDimension.scale(8),
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLOR_THEME.base.primary + '20',
    paddingHorizontal: ScreenDimension.scale(16),
    paddingVertical: ScreenDimension.scale(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    fontSize: ScreenDimension.fontScale(24),
    fontWeight: '600',
    color: COLOR_THEME.base.primary,
    textAlign: 'center',
    paddingVertical: ScreenDimension.scale(12),
  },
  separator: {
    paddingHorizontal: ScreenDimension.scale(8),
    paddingBottom: ScreenDimension.scale(20),
  },
  separatorText: {
    fontSize: ScreenDimension.fontScale(28),
    fontWeight: '700',
    color: COLOR_THEME.base.primary,
  },
  inputHint: {
    fontSize: ScreenDimension.fontScale(12),
    color: '#888',
    marginTop: ScreenDimension.scale(12),
    textAlign: 'center',
  },
  setTimeButton: {
    backgroundColor: COLOR_THEME.base.primary,
    borderRadius: 12,
    paddingVertical: ScreenDimension.scale(16),
    paddingHorizontal: ScreenDimension.scale(24),
    marginTop: ScreenDimension.scale(20),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLOR_THEME.base.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  setTimeButtonText: {
    fontSize: ScreenDimension.fontScale(16),
    fontWeight: '700',
    color: '#fff',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: ScreenDimension.scale(20),
    marginTop: ScreenDimension.scale(8),
    marginBottom: ScreenDimension.scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: ScreenDimension.scale(16),
  },
  infoIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: ScreenDimension.scale(12),
    marginTop: ScreenDimension.scale(2),
  },
  infoText: {
    flex: 1,
    fontSize: ScreenDimension.fontScale(14),
    color: '#666',
    lineHeight: ScreenDimension.scale(20),
  },
});
