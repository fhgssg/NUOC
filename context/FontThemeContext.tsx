import React, {createContext, ReactNode, useEffect, useState} from 'react';
import {TextThemeType} from './type';
import {SplashScreen} from 'expo-router';
import * as Font from 'expo-font';
import {TextTheme} from '@/style/TextTheme';
import {StyleProp} from 'react-native';

type FontThemeContextType = {
  textTheme: any;
};

export const FontContext = createContext<FontThemeContextType>({
  textTheme: TextTheme,
});
const FontThemeContext = ({children}: {children: ReactNode}) => {
  const [fontTheme, setFontTheme] = useState<TextThemeType>(TextTheme);

  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loaded] = Font.useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
        'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
        'Lora-Regular': require('../assets/fonts/Lora-Regular.ttf'),
      });
      setFontsLoaded(true);
      setFontTheme(TextTheme);
    };

    loadFonts();
  }, []);

  useEffect(() => {
    if (loaded && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, fontsLoaded]);

  if (!loaded && !fontsLoaded) {
    return null;
  }

  return (
    <FontContext.Provider
      value={{
        textTheme: fontTheme,
      }}>
      {children}
    </FontContext.Provider>
  );
};

export default FontThemeContext;
