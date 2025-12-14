import {
  Alert,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {ScreenDimension} from '@/constants/Dimensions';
import {COLOR_THEME} from '@/style/ColorTheme';

type BoardingViewProps = {
  title: string;
  image: ImageSourcePropType;
  subText: string;
  textTheme: any;
  step: number;
};
const BoardingView = ({
  image,
  subText,
  title,
  textTheme,
  step,
}: BoardingViewProps) => {
  return (
    <View>
      <View style={styles.imageContent}>
        <Image
          source={image}
          resizeMode="contain"
          style={{
            height: ScreenDimension.windowHeight / 2,
          }}
        />
      </View>
      <View style={styles.textContent}>
        <View>
          <Text style={[textTheme.heading3, styles.headingText]}>{title}</Text>
          <Text style={[textTheme.subText, styles.subText]}>{subText}</Text>
        </View>

        <View style={[styles.dotsContainer]}>
          <TouchableOpacity
            style={[
              styles.dots,
              {
                backgroundColor:
                  step === 1 ? COLOR_THEME.base.primary : '#efefef',
                width: step === 1 ? 30 : 10,
              },
            ]}
          />
          <TouchableOpacity
            style={[
              styles.dots,
              {
                backgroundColor:
                  step === 2 ? COLOR_THEME.base.primary : '#efefef',
                width: step === 2 ? 30 : 10,
              },
            ]}
          />
          <TouchableOpacity
            style={[
              styles.dots,
              {
                backgroundColor:
                  step === 3 ? COLOR_THEME.base.primary : '#efefef',
                width: step === 3 ? 30 : 10,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

export default BoardingView;

const styles = StyleSheet.create({
  imageContent: {
    height: ScreenDimension.windowHeight / 2.4,
  },
  textContent: {
    backgroundColor: '#fff',
    elevation: 10,
    padding: 50,
    height: ScreenDimension.windowHeight / 2.3,
  },
  headingText: {
    textAlign: 'center',
  },
  subText: {
    textAlign: 'center',
    marginTop: 10,
  },
  dotsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    height: 80,
  },
  dots: {
    height: 10,
    width: 10,
    borderRadius: 60,
  },
});
