import {StyleSheet, Text, View} from 'react-native';
import React, {useContext} from 'react';
import {FontContext} from '@/context/FontThemeContext';
import {MaterialIcons, Feather, AntDesign} from '@expo/vector-icons';
import {COLOR_THEME} from '@/style/ColorTheme';
import {ScreenDimension} from '@/constants/Dimensions';

type StatCardProps = {
  icon: 'target' | 'water' | 'flame' | 'trophy';
  title: string;
  value: string | number;
  subtitle?: string;
  progress?: number; // 0-100 for progress bar
};

const StatCard = ({icon, title, value, subtitle, progress}: StatCardProps) => {
  const {textTheme} = useContext(FontContext);

  const renderIcon = () => {
    const iconSize = ScreenDimension.scale(24);
    const iconColor = COLOR_THEME.base.primary;
    switch (icon) {
      case 'target':
        return <MaterialIcons name="gps-fixed" size={iconSize} color={iconColor} />;
      case 'water':
        return <MaterialIcons name="water-drop" size={iconSize} color={iconColor} />;
      case 'flame':
        return <MaterialIcons name="local-fire-department" size={iconSize} color={iconColor} />;
      case 'trophy':
        return <AntDesign name="trophy" size={iconSize} color={iconColor} />;
      default:
        return <Feather name="activity" size={iconSize} color={iconColor} />;
    }
  };

  // Ensure value is always a string
  const valueString = value !== null && value !== undefined ? String(value) : '';

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{renderIcon()}</View>
      <Text style={[textTheme.heading1, styles.value]}>{valueString}</Text>
      <Text style={[textTheme.subText, styles.title]}>{title || ''}</Text>
      {subtitle && (
        <Text style={[textTheme.subText, styles.subtitle]}>{subtitle || ''}</Text>
      )}
      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {width: `${Math.min(progress, 100)}%`},
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default StatCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: ScreenDimension.scale(12),
    alignItems: 'center',
    flex: 1,
    minHeight: ScreenDimension.scale(120),
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: ScreenDimension.scale(6),
  },
  value: {
    fontSize: ScreenDimension.fontScale(22),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: ScreenDimension.scale(4),
  },
  title: {
    fontSize: ScreenDimension.fontScale(12),
    color: '#666',
    textAlign: 'center',
    marginTop: ScreenDimension.scale(4),
  },
  subtitle: {
    fontSize: ScreenDimension.fontScale(11),
    color: '#999',
    textAlign: 'center',
    marginTop: ScreenDimension.scale(2),
  },
  progressContainer: {
    width: '100%',
    marginTop: ScreenDimension.scale(8),
  },
  progressBar: {
    height: ScreenDimension.scale(4),
    backgroundColor: '#efefef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLOR_THEME.base.primary,
    borderRadius: 2,
  },
});




