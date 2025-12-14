import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import React, { useContext, useMemo } from 'react';
import ScreenContainer from '@/components/container/ScreenContainer';
import { AccountOptionList } from './util';
import { FontContext } from '@/context/FontThemeContext';
import { router } from 'expo-router';
import { useAuth } from '@/context/UserAuthContext';
import ProfileHeader from './component/ProfileHeader';
import StatCard from './component/StatCard';
import ProfileMenuOption from './component/ProfileMenuOption';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ScreenDimension } from '@/constants/Dimensions';

const ProfileScreen = () => {
  const { textTheme } = useContext(FontContext);
  const { user, signOut, userWaterIntakeHistory } = useAuth();

  // Tính toán thống kê
  const statistics = useMemo(() => {
    const dailyGoal = user?.dailyGoal || 2000;
    const dailyIntake = user?.dailyIntake || 0;
    const progress = dailyGoal > 0 ? Math.min((dailyIntake / dailyGoal) * 100, 100) : 0;

    // Tính chuỗi ngày (streak) - đếm số ngày liên tiếp đạt mục tiêu
    // Lấy lịch sử và nhóm theo ngày
    const today = format(new Date(), 'yyyy-MM-dd');
    let streak = 0;
    let totalDaysAchieved = 0;

    // Nhóm theo ngày (bao gồm cả dữ liệu từ history và dailyIntake hiện tại)
    const dailyTotals: { [key: string]: number } = {};

    // Thêm dữ liệu từ history
    if (userWaterIntakeHistory && userWaterIntakeHistory.length > 0) {
      userWaterIntakeHistory.forEach(log => {
        if (log.date) {
          dailyTotals[log.date] = (dailyTotals[log.date] || 0) + parseInt(log.amount || '0');
        }
      });
    }

    // Đảm bảo hôm nay có dữ liệu (từ dailyIntake nếu chưa có trong history)
    if (!dailyTotals[today] && dailyIntake > 0) {
      dailyTotals[today] = dailyIntake;
    }

    // Đếm số ngày đạt mục tiêu
    Object.keys(dailyTotals).forEach(date => {
      if (dailyTotals[date] >= dailyGoal) {
        totalDaysAchieved++;
      }
    });

    // Tính streak: đếm từ ngày gần nhất đạt mục tiêu ngược lại
    // Kiểm tra hôm nay có đạt mục tiêu không
    const todayTotal = dailyTotals[today] || dailyIntake;
    const todayAchieved = todayTotal >= dailyGoal;

    // Bắt đầu từ hôm nay nếu đạt, hoặc từ hôm qua nếu hôm nay chưa đạt
    let checkDate = new Date();
    if (!todayAchieved) {
      // Nếu hôm nay chưa đạt, bắt đầu từ hôm qua
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Đếm ngược các ngày liên tiếp đạt mục tiêu
    // Giới hạn tối đa 365 ngày để tránh vòng lặp vô hạn
    let maxDays = 365;
    while (maxDays > 0) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const dateTotal = dailyTotals[dateStr] || 0;

      // Nếu ngày này đạt mục tiêu, tăng streak và tiếp tục
      if (dateTotal >= dailyGoal) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
        maxDays--;
      } else {
        // Nếu ngày này không đạt, dừng lại
        break;
      }
    }

    return {
      dailyGoal,
      dailyIntake,
      progress,
      streak,
      totalDaysAchieved,
    };
  }, [user, userWaterIntakeHistory]);

  const handleLogout = () => {
    Alert.alert(
      'Đăng Xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng Xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(routes)/userInfo');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          },
        },
      ],
    );
  };

  const formatValue = (value: number, unit: string = 'ml'): string => {
    if (value >= 1000 && unit === 'ml') {
      return `${(value / 1000).toFixed(1)}L`;
    }
    return `${value}${unit}`;
  };

  return (
    <ScreenContainer headerTitle="Tài Khoản">
      <View style={styles.container}>
        {/* Profile Header */}
        <ProfileHeader user={user} />

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              icon="target"
              title="Mục Tiêu"
              value={formatValue(statistics.dailyGoal)}
            />
            <StatCard
              icon="water"
              title="Hôm Nay"
              value={formatValue(statistics.dailyIntake)}
              subtitle={`${Math.round(statistics.progress)}% hoàn thành`}
              progress={statistics.progress}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="flame"
              title="Chuỗi Ngày"
              value={statistics.streak}
              subtitle="ngày liên tiếp"
            />
            <StatCard
              icon="trophy"
              title="Tổng Quan"
              value={statistics.totalDaysAchieved}
              subtitle="ngày đạt mục tiêu"
            />
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          {AccountOptionList.map((item, index) => (
            <ProfileMenuOption
              key={item.value}
              icon={item.icon}
              label={item.label}
              onPress={() => {
                if (item.route) {
                  router.push(item.route as any);
                }
              }}
              showBorder={index < AccountOptionList.length - 1}
            />
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <View style={styles.logoutContent}>
            <Feather name="log-out" size={22} color="#EA6230" />
            <Text style={[textTheme.subText, styles.logoutText]}>
              Đăng Xuất
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: ScreenDimension.verticalPadding,
  },
  statsContainer: {
    marginBottom: ScreenDimension.scale(20),
    paddingHorizontal: ScreenDimension.horizontalPadding,
  },
  statsRow: {
    flexDirection: 'row',
    gap: ScreenDimension.scale(12),
    marginBottom: ScreenDimension.scale(12),
  },
  menuContainer: {
    backgroundColor: '#fff',
    width: '100%',
    paddingHorizontal: ScreenDimension.horizontalPadding,
    paddingTop: ScreenDimension.verticalPadding,
    paddingBottom: ScreenDimension.verticalPadding,
    marginBottom: ScreenDimension.scale(20),
  },
  logoutButton: {
    backgroundColor: '#fff',
    width: '100%',
    padding: ScreenDimension.scale(15),
    alignItems: 'center',
    marginBottom: ScreenDimension.scale(20),
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ScreenDimension.scale(10),
  },
  logoutText: {
    fontSize: ScreenDimension.fontScale(18),
    color: '#EA6230',
    fontWeight: '600',
  },
});
