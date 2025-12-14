import { COLOR_THEME } from '@/style/ColorTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  // Đảm bảo chiều cao tối thiểu 60px, tự động thêm padding nếu có nút điều hướng
  const tabBarHeight = Math.max(60, 60 + insets.bottom);
  // Padding bottom tối thiểu 10px, hoặc theo safe area nếu có nút điều hướng
  const tabBarPaddingBottom = Math.max(10, insets.bottom);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLOR_THEME.base.primary,
        tabBarInactiveTintColor: '#ccc',
        tabBarStyle: {
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 12,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarLabelStyle: {
          fontWeight: 'bold',
          marginBottom: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="History"
        options={{
          title: 'Lịch sử',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="history" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Report"
        options={{
          title: 'Báo cáo',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="database" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
