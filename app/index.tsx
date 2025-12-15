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
      const seen = await LocalStorage.getHasSeenOnboarding();
      setHasSeenOnboarding(seen);
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

  if (!hasSeenOnboarding) {
    return <Redirect href={'/(routes)/onBoarding'} />;
  }

  if (user && !user.isCompleted) {
    return <Redirect href={'/(routes)/userInfo'} />;
  }

  return <Redirect href={'/(tabs)'} />;
};

export default Index;