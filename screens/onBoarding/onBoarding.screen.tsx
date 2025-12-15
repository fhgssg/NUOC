import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useContext, useState } from 'react';
import { ScreenDimension } from '@/constants/Dimensions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontContext } from '@/context/FontThemeContext';
import BoardingView from './component/BoardingView';
import { ButtonTheme } from '@/style/ButtonTheme';
import { COLOR_THEME } from '@/style/ColorTheme';
import { router } from 'expo-router';
import * as LocalStorage from '@/storage/localStorage';

const OnBoardingScreen = () => {
  const { textTheme } = useContext(FontContext);
  const [step, setStep] = useState(1);

  // Hàm đánh dấu đã xem onboarding và chuyển đến màn hình nhập thông tin
  const navigateToUserInfo = async () => {
    try {
      // Lưu flag đã xem onboarding
      console.log('[OnBoarding] Setting hasSeenOnboarding to true');
      await LocalStorage.setHasSeenOnboarding(true);
      
      // Verify the value was saved
      const verify = await LocalStorage.getHasSeenOnboarding();
      console.log('[OnBoarding] Verified hasSeenOnboarding:', verify);
      
      // Sau khi Walkthrough xong (Skip hoặc Lets Get Started),
      // chuyển người dùng đến màn hình nhập thông tin cá nhân
      router.replace('/(routes)/userInfo');
    } catch (error) {
      console.error('[OnBoarding] Error saving onboarding status:', error);
      // Still navigate even if save fails
      router.replace('/(routes)/userInfo');
    }
  }


  const renderView = () => {
    if (step === 1) {
      return (
        <BoardingView
          image={require('@/assets/images/appscreen/home.png')}
          step={1}
          key={step}
          subText="Giữ sức khỏe và đạt được mục tiêu hydrat hóa của bạn! Theo dõi lượng nước uống, đặt nhắc nhở và mở khóa thành tích để có một bạn khỏe mạnh hơn."
          textTheme={textTheme}
          title="Người bạn đồng hành hydrat hóa tuyệt vời!"
        />
      );
    }
    if (step === 2) {
      return (
        <BoardingView
          image={require('@/assets/images/appscreen/calendar.png')}
          key={step}
          step={2}
          subText="Đặt nhắc nhở để duy trì nhất quán, xem lại lịch sử hydrat hóa hàng ngày và hình dung tiến trình của bạn theo thời gian"
          textTheme={textTheme}
          title="Theo dõi hydrat hóa & hình dung tiến trình"
        />
      );
    }
    return (
      <BoardingView
        image={require('@/assets/images/appscreen/report.png')}
        step={3}
        key={step}
        subText="Nâng cấp trò chơi hydrat hóa của bạn với thành tích. Biến việc uống nước thành thói quen suốt đời."
        textTheme={textTheme}
        title="Đạt mục tiêu hydrat hóa ngay bây giờ"
      />
    );
  };
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View>{renderView()}</View>
        <View style={styles.actionButton}>
          {step !== 3 && (
            <TouchableOpacity
              onPress={navigateToUserInfo} // FIX: Thay thế bằng hàm chuyển hướng mới
              style={[ButtonTheme.outlinedButton, { width: '45%' }]}>
              <Text
                style={[
                  textTheme.buttonText,
                  { color: COLOR_THEME.base.primary },
                ]}>
                Bỏ qua
              </Text>
            </TouchableOpacity>
          )}
          {step !== 3 && (
            <TouchableOpacity
              onPress={() => setStep(prev => prev + 1)}
              style={[ButtonTheme.containedButton, { width: '45%' }, ,]}>
              <Text style={textTheme.buttonText}>Tiếp tục</Text>
            </TouchableOpacity>
          )}
          {step === 3 && (
            <TouchableOpacity
              onPress={navigateToUserInfo} // FIX: Thay thế bằng hàm chuyển hướng mới
              style={[ButtonTheme.containedButton, { width: '90%' }, ,]}>
              <Text style={textTheme.buttonText}>Bắt đầu</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnBoardingScreen;

const styles = StyleSheet.create({
  container: {
    height: ScreenDimension.windowHeight,
    backgroundColor: COLOR_THEME.base.primary,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    borderTopWidth: 1,
    gap: ScreenDimension.scale(10),
    justifyContent: 'center',
    paddingHorizontal: ScreenDimension.horizontalPadding,
    paddingTop: ScreenDimension.scale(20),
    paddingBottom: ScreenDimension.scale(20),
    borderTopColor: '#efefef',
    backgroundColor: '#fdfdfd',
  },
});