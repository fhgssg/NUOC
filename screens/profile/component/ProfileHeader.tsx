import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useContext } from 'react';
import { FontContext } from '@/context/FontThemeContext';
import { UserInfo } from '@/storage/userinfo/type';
import { ScreenDimension } from '@/constants/Dimensions';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

type ProfileHeaderProps = {
  user: UserInfo | null;
};

const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const { textTheme } = useContext(FontContext);

  // Tính BMI
  const calculateBMI = (): number | null => {
    if (!user || !user.height || !user.weight || user.height === 0) {
      return null;
    }
    const heightInMeters = user.height / 100;
    return Number((user.weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const bmi = calculateBMI();
  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Thiếu cân';
    if (bmi < 23) return 'Bình thường';
    if (bmi < 25) return 'Thừa cân';
    return 'Béo phì';
  };

  // Lấy chữ cái đầu của tên
  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? getInitials(user.name) : 'U'}
            </Text>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={[textTheme.heading1, styles.userName]}>
            {user?.name || 'Người Dùng'}
          </Text>
          {/* Dòng 1: Tuổi */}
          {!!user?.age && (
            <View style={styles.infoRow}>
              <Text style={[textTheme.subText, styles.infoText]}>
                {String(user.age || 0)} tuổi
              </Text>
            </View>
          )}
          {/* Dòng 2: Chiều cao, Cân nặng */}
          {(!!user?.height || !!user?.weight) && (
            <View style={styles.infoRow}>
              {!!user?.height && (
                <Text style={[textTheme.subText, styles.infoText]}>
                  {String(user.height || 0)} cm
                </Text>
              )}
              {!!user?.height && !!user?.weight && (
                <Text style={[textTheme.subText, styles.infoText]}>
                  {' '}•{' '}
                </Text>
              )}
              {!!user?.weight && (
                <Text style={[textTheme.subText, styles.infoText]}>
                  {String(user.weight || 0)} kg
                </Text>
              )}
            </View>
          )}
          {/* Dòng 3: BMI */}
          {!!bmi && (
            <View style={styles.infoRow}>
              <Text style={[textTheme.subText, styles.infoText]}>
                BMI: {String(bmi)} ({getBMICategory(bmi)})
              </Text>
            </View>
          )}
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/(routes)/accountInfo' as any)}
          activeOpacity={0.7}>
          <Feather name="edit-2" size={20} color="#24A8CF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: '100%',
    padding: ScreenDimension.horizontalPadding,
    marginBottom: ScreenDimension.scale(20),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: ScreenDimension.scale(12),
  },
  avatar: {
    width: ScreenDimension.scale(60),
    height: ScreenDimension.scale(60),
    borderRadius: ScreenDimension.scale(30),
    backgroundColor: '#24A8CF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: ScreenDimension.fontScale(24),
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: ScreenDimension.fontScale(20),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: ScreenDimension.scale(4),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ScreenDimension.scale(3),
    flexWrap: 'wrap',
  },
  infoText: {
    fontSize: ScreenDimension.fontScale(13),
    color: '#666',
  },
  editButton: {
    padding: ScreenDimension.scale(8),
    marginLeft: ScreenDimension.scale(8),
  },
});

