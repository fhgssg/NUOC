import {StyleSheet} from 'react-native';
import {COLOR_THEME} from './ColorTheme';

export const ButtonTheme = StyleSheet.create({
  containedButton: {
    backgroundColor: COLOR_THEME.base.primary, // Primary button color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 60,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  containedButtonText: {
    color: '#ffffff', // White text for contained button
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold', // Custom font
  },
  outlinedButton: {
    backgroundColor: '#EEF7FF',
    borderColor: '#EEF7FF', // Border color for outline
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 24,

    width: '100%',
    borderRadius: 60,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlinedButtonText: {
    color: '#1E90FF', // Blue text for outlined button
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold', // Custom font
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 50,
  },
  textButtonText: {
    color: '#1E90FF', // Blue text for text button
    fontSize: 16,
    fontWeight: 'normal',
    fontFamily: 'Poppins-Regular', // Custom font for text button
  },
  disableButtom: {
    backgroundColor: '#ccc',
  },
});
