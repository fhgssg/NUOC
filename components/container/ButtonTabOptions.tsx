import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  DimensionValue,
} from 'react-native';
import React, { useContext } from 'react';
import { OptionsType } from './type';
import { FontContext } from '@/context/FontThemeContext';
import { COLOR_THEME } from '@/style/ColorTheme';

type ButtonTabOptionsType = {
  options: OptionsType[];
  selectedOption: string;
  handleOptionSelect: (selectedOption: string) => void;
  type?: 'primary' | 'secondary';
  buttonWidth?: DimensionValue;
};
const ButtonTabOptions = ({
  options,
  handleOptionSelect,
  selectedOption,
  type = 'primary',
  buttonWidth,
}: ButtonTabOptionsType) => {
  const { textTheme } = useContext(FontContext);

  return (
    <View
      style={{
        width: type === 'secondary' && buttonWidth ? '100%' : 'auto',
        flexDirection: 'row',
        gap: type === 'primary' ? 10 : 0,
        justifyContent: type === 'secondary' && buttonWidth ? 'space-between' : 'center',
      }}>
      {options.map(item => (
        <TouchableOpacity
          style={[
            type === 'primary'
              ? styles.buttonPrimaryContainer
              : styles.buttonSecondaryContainer,
            {
              backgroundColor:
                selectedOption === item.value
                  ? COLOR_THEME.base.primary
                  : '#fff',
            },
            type === 'secondary' && {
              width: buttonWidth,
            },
          ]}
          onPress={() => handleOptionSelect(item.value)}
          key={item.value}>
          <Text
            style={[
              textTheme.subText,
              {
                color: selectedOption === item.value ? '#fff' : '#333',
              },
            ]}>
            {item.icon}
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ButtonTabOptions;

const styles = StyleSheet.create({
  buttonPrimaryContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    height: 50,
    borderRadius: 30,
    width: 70,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSecondaryContainer: {
    borderColor: '#efefef',
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
});
