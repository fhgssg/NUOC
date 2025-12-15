import { LogBox, Platform, ErrorUtils, BackHandler } from 'react-native';

if (BackHandler && typeof BackHandler.removeEventListener !== 'function') {
  BackHandler.removeEventListener = function (eventName: string, handler: () => boolean) {
  };
}

if (__DEV__) {
  if (ErrorUtils && typeof ErrorUtils.getGlobalHandler === 'function' && typeof ErrorUtils.setGlobalHandler === 'function') {
    try {
      const originalGlobalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        const errorMessage = error?.message || error?.toString() || '';
        const errorName = error?.name || '';

        const isExpectedError =
          errorName.includes('WorkletsError') ||
          errorMessage.includes('Worklets') ||
          errorMessage.includes('Mismatch between JavaScript part and native part of Worklets') ||
          errorMessage.includes('expo-notifications') ||
          errorMessage.includes('Android Push notifications') ||
          errorMessage.includes('removed from Expo Go') ||
          errorMessage.includes('functionality provided by expo-notifications was removed') ||
          errorMessage.includes('Trigger of type: calendar is not supported on Android') ||
          errorMessage.includes('Error scheduling morning notification');

        console.error('=== GLOBAL ERROR HANDLER ===');
        console.error('Error Name:', errorName);
        console.error('Error Message:', errorMessage);
        console.error('Is Fatal:', isFatal);
        console.error('Full Error:', error);
        console.error('Stack:', error?.stack);
        console.error('===========================');

        if (isExpectedError) {
          console.warn('Suppressed expected error:', errorMessage);
          return;
        }

        if (originalGlobalHandler) {
          originalGlobalHandler(error, isFatal);
        }
      });
    } catch (e) {
      console.warn('ErrorUtils API not available, using LogBox only');
    }
  }

  LogBox.ignoreLogs([
    'Worklets',
    'WorkletsError',
    'Mismatch between JavaScript part and native part of Worklets',
    '0.6.1 vs 0.5.1',
    'expo-notifications: Android Push notifications',
    'Android Push notifications',
    'removed from Expo Go',
    'expo-notifications functionality is not fully supported in Expo Go',
    'Use a development build instead of Expo Go',
    'functionality provided by expo-notifications was removed',
    'is missing the required default export',
    'You are initializing Firebase Auth for React Native without providing AsyncStorage',
    'Auth state will default to memory persistence',
    '@firebase/auth: Auth',
  ]);

  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args: any[]) => {
    const message = args.join(' ').toLowerCase();
    if (
      message.includes('worklets') ||
      message.includes('workletserror') ||
      message.includes('mismatch between javascript part and native part') ||
      message.includes('expo-notifications') ||
      message.includes('android push notifications') ||
      message.includes('removed from expo go') ||
      message.includes('was removed from expo go') ||
      message.includes('functionality provided by expo-notifications was removed') ||
      message.includes('firebase auth') ||
      message.includes('asyncstorage') ||
      message.includes('memory persistence') ||
      message.includes('trigger of type: calendar is not supported on android') ||
      message.includes('error scheduling morning notification')
    ) {
      return;
    }
    console.log('=== CONSOLE ERROR ===');
    originalError.apply(console, args);
    if (args.length > 0) {
      args.forEach((arg, index) => {
        if (arg instanceof Error) {
          console.log(`Error ${index}:`, arg.message);
          console.log('Stack:', arg.stack);
        } else {
          console.log(`Arg ${index}:`, typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg);
        }
      });
    }
    console.log('===================');
  };

  console.warn = (...args: any[]) => {
    const message = args.join(' ').toLowerCase();
    if (
      message.includes('worklets') ||
      message.includes('expo-notifications') ||
      message.includes('android push notifications') ||
      message.includes('removed from expo go') ||
      message.includes('was removed from expo go') ||
      message.includes('functionality provided by expo-notifications was removed') ||
      message.includes('firebase auth') ||
      message.includes('asyncstorage')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useRef } from 'react';

import 'react-native-reanimated';

import FontThemeContextProvider from '@/context/FontThemeContext';
import { UserAuthContextProvider } from '@/context/UserAuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const notificationHandlerSetup = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web' || notificationHandlerSetup.current) return;

    notificationHandlerSetup.current = true;

    import('expo-notifications').then((NotificationsModule) => {
      try {
        const Notifications = NotificationsModule.default || NotificationsModule;
        Notifications.setNotificationHandler({
          handleNotification: async (notification) => {
            return {
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: false,
              shouldShowBanner: true,
              shouldShowList: true,
            };
          },
        });
      } catch (error) {
        console.warn('Notification handler setup failed (expected on Expo Go):', error);
      }
    }).catch((error) => {
      console.warn('Failed to load expo-notifications (expected on Expo Go):', error);
    });
  }, []);

  return (
    <UserAuthContextProvider>
      <FontThemeContextProvider>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />

            <Stack.Screen name="(auth)" options={{ headerShown: false }} />

            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(routes)/onBoarding/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(routes)/userInfo/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(routes)/drinkReminder/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(routes)/accountInfo/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(routes)/editHealthInfo/index"
              options={{ headerShown: false }}
            />
          </Stack>
        </ThemeProvider>
      </FontThemeContextProvider>
    </UserAuthContextProvider>
  );
}
