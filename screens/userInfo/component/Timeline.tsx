import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Icon from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontContext } from '@/context/FontThemeContext';
import { COLOR_THEME } from '@/style/ColorTheme';

type TimelineProps = {
  step: number;
  handleBack: () => void;
};
const Timeline = ({ step, handleBack }: TimelineProps) => {
  const insets = useSafeAreaInsets();
  const { textTheme } = useContext(FontContext);
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingHorizontal: 20,
        },
      ]}>
      <TouchableOpacity onPress={handleBack} style={[styles.iconStyle]}>
        {step !== 1 && <Icon name={'arrow-left'} size={20} />}
      </TouchableOpacity>

      <View style={styles.progress}>
        <View
          style={{
            width: `${Number(((step / 9) * 100).toFixed(0))}%`,
            backgroundColor: COLOR_THEME.base.primary,
            height: 15,
            borderTopLeftRadius: 60,
            borderRadius: 60,
            borderBottomLeftRadius: 60,
          }}
        />
      </View>
      <View>
        <Text style={[textTheme.heading3, { fontSize: 18 }]}>{step}/9</Text>
      </View>
    </View>
  );
};

export default Timeline;

export const styles = StyleSheet.create({
  container: {
    minHeight: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  iconStyle: {
    minWidth: 30,
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progress: {
    height: 15,
    width: '70%',
    backgroundColor: '#ccc',
    borderRadius: 30,
  },
});
