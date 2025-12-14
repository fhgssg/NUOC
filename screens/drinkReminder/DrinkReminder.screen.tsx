import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { COLOR_THEME } from '@/style/ColorTheme';
import { useDrinkReminder } from './hook';
import { FontAwesome } from '@expo/vector-icons';
import { REMINDER_INTERVALS, getIntervalLabel, ReminderInterval } from './util';
import { ScreenDimension } from '@/constants/Dimensions';
import ScreenContainer from '@/components/container/ScreenContainer';

const DrinkReminder = () => {
  const { isReminderActive, toggleReminder, selectedInterval, updateInterval } = useDrinkReminder();

  return (
    <ScreenContainer headerTitle="Nhắc nhở uống nước" showBackButton={true}>
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
              trackColor={{ false: '#ccc', true: '#4CAF50' }}
              thumbColor={isReminderActive ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Interval Selection */}
        {isReminderActive && (
          <View style={styles.settingContainer}>
            <Text style={styles.sectionTitle}>Tần suất nhắc nhở</Text>
            <Text style={styles.sectionSubtitle}>
              Chọn khoảng thời gian giữa các lần nhắc nhở
            </Text>
            <View style={styles.intervalContainer}>
              {(Object.keys(REMINDER_INTERVALS) as ReminderInterval[]).map((interval) => {
                const isSelected = selectedInterval === interval;
                return (
                  <TouchableOpacity
                    key={interval}
                    style={[
                      styles.intervalOption,
                      isSelected && styles.intervalOptionSelected,
                    ]}
                    onPress={() => updateInterval(interval)}>
                    <Text
                      style={[
                        styles.intervalText,
                        isSelected && styles.intervalTextSelected,
                      ]}>
                      {getIntervalLabel(interval)}
                    </Text>
                    {isSelected && (
                      <FontAwesome name="check-circle" size={20} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <FontAwesome name="info-circle" size={16} color="#2196F3" />
            <Text style={styles.infoText}>
              Thông báo sẽ hoạt động ngay cả khi app đóng
            </Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome name="trophy" size={16} color="#FF9800" />
            <Text style={styles.infoText}>
              Bạn sẽ nhận thông báo khi đạt mục tiêu uống nước
            </Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome name="lightbulb-o" size={16} color="#9C27B0" />
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
  title: {
    fontSize: ScreenDimension.fontScale(24),
    fontWeight: 'bold',
    color: COLOR_THEME.base.primary,
    marginBottom: ScreenDimension.scale(20),
  },
  info: {
    fontSize: ScreenDimension.fontScale(16),
    marginVertical: ScreenDimension.scale(10),
    color: '#333',
  },
  label: {
    fontSize: ScreenDimension.fontScale(16),
    fontWeight: '500',
    marginTop: ScreenDimension.scale(20),
    marginBottom: ScreenDimension.scale(10),
    color: '#333',
  },
  picker: {
    height: ScreenDimension.scale(50),
    width: ScreenDimension.scale(200),
  },
  content: {
    padding: ScreenDimension.horizontalPadding,
    paddingTop: ScreenDimension.scale(20),
  },
  settingContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: ScreenDimension.scale(15),
    marginBottom: ScreenDimension.scale(15),
    marginTop: ScreenDimension.scale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ScreenDimension.scale(5),
  },
  settingTextContainer: {
    flex: 1,
    marginRight: ScreenDimension.scale(10),
  },
  settingText: {
    fontSize: ScreenDimension.fontScale(16),
    fontWeight: '500',
    color: '#333',
    marginBottom: ScreenDimension.scale(4),
  },
  settingSubtext: {
    fontSize: ScreenDimension.fontScale(12),
    color: '#888',
  },
  sectionTitle: {
    fontSize: ScreenDimension.fontScale(18),
    fontWeight: '600',
    color: '#333',
    marginBottom: ScreenDimension.scale(5),
  },
  sectionSubtitle: {
    fontSize: ScreenDimension.fontScale(13),
    color: '#888',
    marginBottom: ScreenDimension.scale(15),
  },
  intervalContainer: {
    gap: ScreenDimension.scale(10),
  },
  intervalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ScreenDimension.scale(15),
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  intervalOptionSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  intervalText: {
    fontSize: ScreenDimension.fontScale(16),
    color: '#333',
  },
  intervalTextSelected: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: ScreenDimension.scale(15),
    marginTop: ScreenDimension.scale(10),
    marginBottom: ScreenDimension.scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: ScreenDimension.scale(12),
    gap: ScreenDimension.scale(10),
  },
  infoText: {
    flex: 1,
    fontSize: ScreenDimension.fontScale(14),
    color: '#666',
    lineHeight: ScreenDimension.scale(20),
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ScreenDimension.scale(15),
    paddingVertical: ScreenDimension.scale(15),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  linkText: {
    fontSize: ScreenDimension.fontScale(16),
    color: '#333',
  },
  linkValue: {
    fontSize: ScreenDimension.fontScale(16),
    color: '#888',
  },
});
