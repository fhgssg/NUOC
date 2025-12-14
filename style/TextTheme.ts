import {StyleSheet} from 'react-native';
import {COLOR_THEME} from './ColorTheme';

export const TextTheme = StyleSheet.create({
  heading1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 40,
    fontFamily: 'Poppins-Bold', // Use Poppins for bold headings
  },
  heading2: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 36,
    fontFamily: 'Poppins-Bold',
  },
  heading3: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 36,
    fontFamily: 'Poppins-Bold',
  },
  paragraph: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#666666',
    lineHeight: 24,
    fontFamily: 'Lora-Regular', // Use Lora for body text
  },
  subText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#888888',
    fontFamily: 'Poppins-Regular',
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#999999',
    fontFamily: 'Poppins-Bold',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444444',
    fontFamily: 'Montserrat-Bold', // Using Montserrat for labels
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    fontFamily: 'Poppins-Regular', // Consistent button text style
  },
  linkText: {
    fontSize: 16,
    color: COLOR_THEME.base.primary,
    fontFamily: 'Poppins-Regular',
    lineHeight: 36,
    textDecorationLine: 'underline',
  },
  smallText: {
    fontSize: 12,
    color: '#aaaaaa',
    fontFamily: 'Lora-Regular',
  },
});
