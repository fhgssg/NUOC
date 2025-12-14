import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {COLOR_THEME} from '@/style/ColorTheme';

type WaterDropProps = {
  value: number;
};
const WaterDrop = ({value}: WaterDropProps) => {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.active,
          {
            height: `${value}%`,
          },
        ]}></View>
    </View>
  );
};

export default WaterDrop;

const styles = StyleSheet.create({
  container: {
    borderWidth: 10,
    borderCurve: 'circular',
    borderColor: '#efefef',
    borderRadius: 200,
    borderTopRightRadius: 0,
    height: 120,
    width: 120,
    overflow: 'hidden',
    backgroundColor: '#ccc',
    position: 'relative',
    elevation: 5,
  },
  active: {
    borderCurve: 'circular',
    borderTopRightRadius: 0,
    width: 150,
    backgroundColor: COLOR_THEME.base.primary,
    position: 'absolute',
    bottom: 0,
  },
});
