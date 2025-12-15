import React, { useContext, useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { UserAuthContext } from '../context/UserAuthContext';
import * as LocalStorage from '../storage/localStorage';

const Index = () => {
  const authContext = useContext(UserAuthContext);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const seen = await LocalStorage.getHasSeenOnboarding();
        console.log('[Index] hasSeenOnboarding value:', seen);
        setHasSeenOnboarding(seen);
      } catch (error) {
        console.error('[Index] Error checking onboarding:', error);
        setHasSeenOnboarding(false);
      }
    };
    checkOnboarding();
  }, []);

  if (!authContext) {
    return <View style={{ flex: 1, backgroundColor: '#F5F5F5' }} />;
  }

  const { isLoading, user } = authContext;

  if (isLoading || hasSeenOnboarding === null) {
    return <View style={{ flex: 1, backgroundColor: '#F5F5F5' }} />;
  }

  console.log('[Index] Rendering with hasSeenOnboarding:', hasSeenOnboarding, 'user:', user?.isCompleted);

  // Nếu user đã hoàn thành thông tin (isCompleted = true), 
  // thì không cần hiển thị onboarding nữa, ngay cả khi flag bị mất
  const shouldShowOnboarding = !hasSeenOnboarding && !(user?.isCompleted);

  if (shouldShowOnboarding) {
    return <Redirect href={'/(routes)/onBoarding'} />;
  }

  if (user && !user.isCompleted) {
    return <Redirect href={'/(routes)/userInfo'} />;
  }

  return <Redirect href={'/(tabs)'} />;
};

export default Index;