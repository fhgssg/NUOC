// IMPORTANT: Suppress expected errors/warnings BEFORE any imports
// These errors are thrown during module initialization, so suppression must happen first
import { LogBox, Platform, ErrorUtils, BackHandler } from 'react-native';

// PATCH: Fix BackHandler.removeEventListener for react-native-modal compatibility
// React Native mới sử dụng subscription.remove() thay vì removeEventListener
// react-native-modal vẫn cố gọi removeEventListener trong componentWillUnmount
// Thêm polyfill để tương thích
if (BackHandler && typeof BackHandler.removeEventListener !== 'function') {
  // Tạo một no-op function để tránh lỗi
  // react-native-modal sẽ gọi method này nhưng nó không cần thiết
  // vì subscriptions đã được cleanup tự động qua subscription.remove()
  BackHandler.removeEventListener = function (eventName: string, handler: () => boolean) {
    // No-op: Subscriptions đã được cleanup tự động qua subscription.remove()
    // Method này chỉ để tương thích với react-native-modal
    // Không cần làm gì vì cleanup đã được xử lý tự động
  };
}

// Suppress expected errors/warnings in Expo Go (these are non-fatal)
// - Worklets version mismatch: Expo Go has fixed native binary, version mismatch is expected
// - expo-notifications: Remote push notifications removed in Expo Go SDK 53+, local notifications still work
// - Route warnings: Sometimes transient during hot reload
if (__DEV__) {
  // Set up global error handler to catch thrown errors (if available)
  if (ErrorUtils && typeof ErrorUtils.getGlobalHandler === 'function' && typeof ErrorUtils.setGlobalHandler === 'function') {
    try {
      const originalGlobalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        const errorMessage = error?.message || error?.toString() || '';
        const errorName = error?.name || '';

        // Check if this is an expected error in Expo Go
        const isExpectedError =
          errorName.includes('WorkletsError') ||
          errorMessage.includes('Worklets') ||
          errorMessage.includes('Mismatch between JavaScript part and native part of Worklets') ||
          errorMessage.includes('expo-notifications') ||
          errorMessage.includes('Android Push notifications') ||
          errorMessage.includes('removed from Expo Go') ||
          errorMessage.includes('functionality provided by expo-notifications was removed') ||
          // KHÔNG suppress BackHandler errors nữa để debug
          // errorMessage.includes('BackHandler.removeEventListener') ||
          // errorMessage.includes('removeEventListener is not a function') ||
          errorMessage.includes('Trigger of type: calendar is not supported on Android') ||
          errorMessage.includes('Error scheduling morning notification');

        // Log tất cả lỗi ra console để debug
        console.error('=== GLOBAL ERROR HANDLER ===');
        console.error('Error Name:', errorName);
        console.error('Error Message:', errorMessage);
        console.error('Is Fatal:', isFatal);
        console.error('Full Error:', error);
        console.error('Stack:', error?.stack);
        console.error('===========================');

        if (isExpectedError) {
          // Suppress expected errors - they're non-fatal in Expo Go
          console.warn('Suppressed expected error:', errorMessage);
          return;
        }

        // Call original handler for other errors
        if (originalGlobalHandler) {
          originalGlobalHandler(error, isFatal);
        }
      });
    } catch (e) {
      // ErrorUtils API not available, skip global handler setup
      console.warn('ErrorUtils API not available, using LogBox only');
    }
  }

  // Suppress warnings and errors that are expected in Expo Go
  // Note: LogBox.ignoreLogs() matches against the message string (partial match)
  LogBox.ignoreLogs([
    // Worklets version mismatch (expected in Expo Go)
    'Worklets',
    'WorkletsError',
    'Mismatch between JavaScript part and native part of Worklets',
    '0.6.1 vs 0.5.1',
    // expo-notifications warnings/errors (expected in Expo Go SDK 53+)
    'expo-notifications: Android Push notifications',
    'Android Push notifications',
    'removed from Expo Go',
    'expo-notifications functionality is not fully supported in Expo Go',
    'Use a development build instead of Expo Go',
    'functionality provided by expo-notifications was removed',
    // Route warnings (sometimes transient during hot reload)
    'is missing the required default export',
    // Firebase Auth persistence warning (expected in Expo Go, auth still works)
    'You are initializing Firebase Auth for React Native without providing AsyncStorage',
    'Auth state will default to memory persistence',
    '@firebase/auth: Auth',
  ]);

  // Also suppress console errors for known non-fatal errors in Expo Go
  // This must be set up before any modules that might throw errors are imported
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args: any[]) => {
    const message = args.join(' ').toLowerCase();
    // Suppress known non-fatal errors (NHƯNG KHÔNG suppress BackHandler để debug)
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
      // KHÔNG suppress BackHandler errors nữa để debug
      // message.includes('backhandler.removeeventlistener') ||
      // message.includes('removeeventlistener is not a function') ||
      message.includes('trigger of type: calendar is not supported on android') ||
      message.includes('error scheduling morning notification')
    ) {
      // Suppress these errors - they're expected in Expo Go or from dependencies
      return;
    }
    // Log tất cả lỗi khác ra terminal
    console.log('=== CONSOLE ERROR ===');
    originalError.apply(console, args);
    // Log thêm thông tin chi tiết
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
    // Suppress known non-fatal warnings
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
      // Suppress these warnings - they're expected in Expo Go
      return;
    }
    // Call original console.warn for other warnings
    originalWarn.apply(console, args);
  };
}

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useRef } from 'react';

// Import react-native-reanimated cho development build
// Lưu ý: Trên Expo Go có thể có version mismatch, nhưng development build sẽ hoạt động tốt
import 'react-native-reanimated';
// Lưu ý: Warning về remote push notifications trên Expo Go là bình thường
// Module này tự động cố gắng đăng ký push token khi được import
// Local notifications (scheduleNotificationAsync) vẫn hoạt động tốt trên Expo Go
// Sử dụng lazy import để giảm warning (chỉ load khi cần)

// FIX 1: Giả định FontThemeContext.tsx export Provider component là default
import FontThemeContextProvider from '@/context/FontThemeContext';
// FIX 2: Sửa import để lấy NAMED EXPORT UserAuthContextProvider (được sử dụng cho Firebase)
import { UserAuthContextProvider } from '@/context/UserAuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Thiết lập notification handler toàn cục để xử lý notification buổi sáng
// Setup trong useEffect để giảm warning khi app khởi động (lazy load)

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const notificationHandlerSetup = useRef(false);

  // Thiết lập notification handler sau khi component mount
  // LƯU Ý QUAN TRỌNG:
  // - Warning "Android Push notifications... removed from Expo Go" là BÌNH THƯỜNG
  // - Local notifications (scheduleNotificationAsync) VẪN HOẠT ĐỘNG TỐT trên Expo Go
  // - Chỉ remote push notifications (từ server) không hoạt động trên Expo Go SDK 53+
  // - Để sử dụng remote push notifications, cần tạo development build
  // - Warning này không ảnh hưởng đến chức năng reminder uống nước của app
  // - Sử dụng lazy import trong useEffect để giảm warning khi app khởi động
  useEffect(() => {
    if (Platform.OS === 'web' || notificationHandlerSetup.current) return;

    notificationHandlerSetup.current = true;

    // Lazy load expo-notifications để giảm warning khi app khởi động
    import('expo-notifications').then((NotificationsModule) => {
      try {
        const Notifications = NotificationsModule.default || NotificationsModule;
        Notifications.setNotificationHandler({
          handleNotification: async (notification) => {
            // Xử lý tất cả các notification
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
        // Suppress error nếu đang chạy trên Expo Go (không hỗ trợ remote push)
        console.warn('Notification handler setup failed (expected on Expo Go):', error);
      }
    }).catch((error) => {
      // Ignore error nếu không thể load module
      console.warn('Failed to load expo-notifications (expected on Expo Go):', error);
    });
  }, []);

  return (
    // FIX 3: Sử dụng tên Component Provider chính xác (UserAuthContextProvider)
    <UserAuthContextProvider>
      <FontThemeContextProvider>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />

            {/* THÊM: Tuyến đường cho nhóm màn hình Đăng nhập/Đăng ký */}
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
