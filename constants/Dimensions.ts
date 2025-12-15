import { Dimensions, Platform } from "react-native";

const getWindowDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

const windowDimensions = getWindowDimensions();

const isSmallScreen = windowDimensions.width < 375;
const isMediumScreen = windowDimensions.width >= 375 && windowDimensions.width < 414;
const isLargeScreen = windowDimensions.width >= 414;

export const ScreenDimension = {
  windowWidth: windowDimensions.width,
  windowHeight: windowDimensions.height,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  scale: (size: number) => {
    if (isSmallScreen) return size * 0.9;
    if (isLargeScreen) return size * 1.1;
    return size;
  },
  fontScale: (size: number) => {
    const scale = windowDimensions.width / 375;
    return Math.max(0.8, Math.min(1.2, scale)) * size;
  },
  horizontalPadding: isSmallScreen ? 15 : 20,
  verticalPadding: isSmallScreen ? 10 : 15,
  getDimensions: () => Dimensions.get('window'),
}