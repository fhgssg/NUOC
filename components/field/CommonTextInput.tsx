import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
} from 'react-native';
import React, {useContext} from 'react';
import {FontContext} from '@/context/FontThemeContext';

type CommonTextInputProps = {
  additionalStyling?: StyleProp<TextStyle>;
  handleChangeText: (value: string) => void;
  value: string;
  endAdorment?: string;
} & TextInputProps;
const CommonTextInput = ({
  handleChangeText,
  additionalStyling,
  value,
  endAdorment,
  ...rest
}: CommonTextInputProps) => {
  const {textTheme} = useContext(FontContext);
  return (
    <View style={styles.container}>
      <TextInput
        style={[additionalStyling, styles.textInput]}
        value={value}
        onChangeText={handleChangeText}
        {...rest}
      />
      {endAdorment && <Text style={textTheme.subText}>{endAdorment}</Text>}
    </View>
  );
};

export default CommonTextInput;

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    backgroundColor: '#FAFBFB',
    height: 50,
    display: 'flex',
    fontSize: 18,
    color: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    borderRadius: 30,
    backgroundColor: '#FAFBFB',
    height: 50,
    paddingHorizontal: 30,
    fontSize: 18,
    color: '#333',
    width: '90%',
  },
});
