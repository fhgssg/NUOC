import React, { useContext } from 'react';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { UserAuthContext } from '../context/UserAuthContext';

const Index = () => {
  // Use useContext directly to avoid hook error during route evaluation
  const authContext = useContext(UserAuthContext);

  // If context is not available yet, show loading
  if (!authContext) {
    return <View style={{ flex: 1, backgroundColor: '#F5F5F5' }} />;
  }

  const { isLoading, user } = authContext;

  if (isLoading) {
    // Đang tải dữ liệu
    return <View style={{ flex: 1, backgroundColor: '#F5F5F5' }} />;
  }

  // Offline-first: Kiểm tra xem đã hoàn tất thông tin sức khỏe chưa
  if (user && !user.isCompleted) {
    // Nếu chưa hoàn tất, chuyển đến màn hình nhập thông tin sức khỏe
    return <Redirect href={'/(routes)/userInfo'} />;
  }

  // Đã hoàn tất thông tin, chuyển đến Dashboard
  return <Redirect href={'/(tabs)'} />;
};

export default Index;