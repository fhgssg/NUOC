import { Dimensions, Platform } from "react-native";

// Lấy kích thước màn hình hiện tại
const getWindowDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

// Khởi tạo kích thước
const windowDimensions = getWindowDimensions();

// Tính toán responsive dựa trên kích thước màn hình
const isSmallScreen = windowDimensions.width < 375;
const isMediumScreen = windowDimensions.width >= 375 && windowDimensions.width < 414;
const isLargeScreen = windowDimensions.width >= 414;

export const ScreenDimension = {
  windowWidth: windowDimensions.width,
  windowHeight: windowDimensions.height,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  // Responsive scaling factors
  scale: (size: number) => {
    if (isSmallScreen) return size * 0.9;
    if (isLargeScreen) return size * 1.1;
    return size;
  },
  // Responsive font scaling
  fontScale: (size: number) => {
    const scale = windowDimensions.width / 375; // Base width 375 (iPhone X)
    return Math.max(0.8, Math.min(1.2, scale)) * size;
  },
  // Responsive padding
  horizontalPadding: isSmallScreen ? 15 : 20,
  verticalPadding: isSmallScreen ? 10 : 15,
  // Helper để lấy kích thước mới nhất
  getDimensions: () => Dimensions.get('window'),
}