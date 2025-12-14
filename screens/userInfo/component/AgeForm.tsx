import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { FontContext } from '@/context/FontThemeContext';
import { ButtonTheme } from '@/style/ButtonTheme';
import DropdownSelector from './DropdownSelector';

type AgeFormProps = {
  initialValue?: string;
  updateAge: (age: string) => void;
};
const AgeForm = ({ updateAge, initialValue }: AgeFormProps) => {
  const { textTheme } = useContext(FontContext);
  const [selectedAge, setSelectedAge] = useState<string>(initialValue || '28');
  const [disableButton, setDisableButton] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setDisableButton(false);
    }, 500);
  }, []);
  return (
    <View style={[styles.container]}>
      <View style={{ flex: 1 }}>
        <View style={styles.form}>
          <Text style={[textTheme.heading3, styles.title]}>
            Tuổi của bạn là bao nhiêu?
          </Text>
          <Text style={[textTheme.subText, styles.title, { marginTop: 10 }]}>
            Tuổi tác cũng có tác động đến nhu cầu hydrat hóa của cơ thể bạn. Cuộn và chọn tuổi của bạn từ các tùy chọn bên dưới
          </Text>
          <View style={styles.heightContainer}>
            <View style={styles.heightSelect}>
              <DropdownSelector
                setSelectedOption={setSelectedAge}
                selectedOption={selectedAge}
                label="tuổi"
                options={Array.from({ length: 100 }, (_, i) => `${10 + i}`)}
              />
            </View>
          </View>
        </View>
        <View style={styles.actionButton}>
          <TouchableOpacity
            onPress={() => {
              updateAge(selectedAge);
            }}
            style={[
              ButtonTheme.containedButton,
              disableButton && ButtonTheme.disableButtom,
              { width: '90%' },
            ]}>
            <Text style={textTheme.buttonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AgeForm;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    flex: 7,
    paddingHorizontal: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    borderTopWidth: 1,
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 20,
    borderTopColor: '#ccc',
  },
  title: {
    textAlign: 'center',
  },
  heightContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
    marginVertical: 30,
    flex: 1,
    // alignItems: 'center',
  },
  imageView: {
    flex: 1,

    // backgroundColor: 'red',
  },
  heightSelect: {
    flex: 1,
  },
});
