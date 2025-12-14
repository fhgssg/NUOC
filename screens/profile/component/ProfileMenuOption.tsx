import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useContext, ReactNode} from 'react';
import {FontContext} from '@/context/FontThemeContext';
import {Entypo} from '@expo/vector-icons';

type ProfileMenuOptionProps = {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  showBorder?: boolean;
};

const ProfileMenuOption = ({
  icon,
  label,
  onPress,
  showBorder = true,
}: ProfileMenuOptionProps) => {
  const {textTheme} = useContext(FontContext);

  return (
    <TouchableOpacity
      style={[styles.container, !showBorder && styles.noBorder]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>{icon || null}</View>
        <Text style={[textTheme.heading3, styles.label]}>{label || ''}</Text>
      </View>
      <Entypo name="chevron-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );
};

export default ProfileMenuOption;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flex: 1,
  },
  iconContainer: {
    width: 22,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    color: '#333',
  },
});

