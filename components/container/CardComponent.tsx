import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext} from 'react';
import {COLOR_THEME} from '@/style/ColorTheme';
import {FontContext} from '@/context/FontThemeContext';

type CardComponentProps = {
  title: string;
  icon: ImageSourcePropType;
  description?: string;
  isSelected: boolean;
  handleOptionSelect: () => void;
};
const CardComponent = ({
  handleOptionSelect,
  icon,
  isSelected,
  title,
  description,
}: CardComponentProps) => {
  const {textTheme} = useContext(FontContext);
  return (
    <TouchableOpacity
      onPress={handleOptionSelect}
      style={[
        styles.container,
        {
          borderColor: isSelected ? COLOR_THEME.base.primary : '#ccc',
          borderWidth: isSelected ? 3 : 1,
        },
      ]}>
      <View>
        <Image
          source={icon}
          resizeMode="contain"
          style={{
            height: 40,
            width: 40,
          }}
        />
      </View>
      <View style={{flex: 1}}>
        <Text style={textTheme.label}>{title}</Text>
        {description && <Text style={[textTheme.subText]}>{description}</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default CardComponent;

const styles = StyleSheet.create({
  container: {
    borderColor: '#ccc',
    borderRadius: 10,
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    gap: 30,
    marginBottom: 10,
  },
});
