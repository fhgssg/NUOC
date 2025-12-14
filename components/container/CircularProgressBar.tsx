import {COLOR_THEME} from '@/style/ColorTheme';
import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Circle, G} from 'react-native-svg';

type CircularProgressBarProps = {
  radius?: number;
  strokeWidth?: number;
  duration?: number; // Time for full progress in seconds
  durationCompleted?: () => void;
  removeInterval?: boolean;
};

const CircularProgressBar = ({
  radius = 100,
  strokeWidth = 10,
  duration = 100,
  removeInterval = false,
  durationCompleted,
}: CircularProgressBarProps) => {
  const [progress, setProgress] = useState(0);
  const maxPercentage = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progress) / 100;
  const normalizedRadius = radius - strokeWidth / 2;

  useEffect(() => {
    if (progress >= maxPercentage) {
      durationCompleted && durationCompleted();
    }
  }, [progress]);

  useEffect(() => {
    if (!removeInterval) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= maxPercentage) {
            clearInterval(interval); // Stop when it reaches 100%
            return maxPercentage;
          }
          return prev + 1;
        });
      }, (duration / 100) * 1000); // Adjust time for the interval to complete in `duration` seconds.

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, []);

  return (
    <View style={styles.container}>
      <Svg
        height={radius * 2}
        width={radius * 2}
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <G rotation="-90" origin={`${radius}, ${radius}`}>
          {/* Background Circle */}
          <Circle
            cx="50%"
            cy="50%"
            r={normalizedRadius}
            stroke="#e6e6e6"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Circle */}
          <Circle
            cx="50%"
            cy="50%"
            r={normalizedRadius}
            stroke={COLOR_THEME.base.primary} // Change this to your progress bar color
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
      {/* Center Text */}
      <View style={styles.center}>
        <Text style={styles.percentageText}>{progress}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLOR_THEME.base.primary,
  },
});

export default CircularProgressBar;
