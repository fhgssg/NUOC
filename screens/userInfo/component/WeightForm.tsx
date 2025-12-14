import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { FontContext } from '@/context/FontThemeContext';
import { ButtonTheme } from '@/style/ButtonTheme';
import DropdownSelector from './DropdownSelector';
import { GenderType } from '@/storage/userinfo/type';

type WeightFormProps = {
  initialValue?: string;
  updateWeight: (weight: string) => void;
  gender?: GenderType;
};
const WeightForm = ({ updateWeight, initialValue, gender }: WeightFormProps) => {
  const { textTheme } = useContext(FontContext);
  const [selectedWeight, setSelectedWeight] = useState<string>(
    initialValue || '60',
  );
  const [disableButton, setDisableButton] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setDisableButton(false);
    }, 500);
  }, []);
  const renderPersonImage = () => {
    if (Number(selectedWeight) < 60) {
      return gender === 'male'
        ? require('@/assets/images/sizes/slim.png')
        : require('@/assets/images/sizes/girl_slim.png');
    }
    if (Number(selectedWeight) >= 60 && Number(selectedWeight) <= 80) {
      return gender === 'male'
        ? require('@/assets/images/sizes/fit.png')
        : require('@/assets/images/sizes/girl_fit.png');
    }
    return gender === 'male'
      ? require('@/assets/images/sizes/fat.png')
      : require('@/assets/images/sizes/girl_fat.png');
  };
  return (
    <View style={[styles.container]}>
      <View style={{ flex: 1 }}>
        <View style={styles.form}>
          <Text style={[textTheme.heading3, styles.title]}>
            Cân nặng của bạn là bao nhiêu?
          </Text>
          <Text style={[textTheme.subText, styles.title, { marginTop: 10 }]}>
            Cân nặng của bạn đóng vai trò quan trọng trong việc xác định nhu cầu hydrat hóa của bạn. Chọn cân nặng của bạn bên dưới
          </Text>
          <View style={styles.heightContainer}>
            <View style={styles.imageView}>
              <Image
                source={renderPersonImage()}
                resizeMode="contain"
                style={{
                  height: '100%',
                  width: '100%',
                }}
              />
            </View>
            <View style={styles.heightSelect}>
              <DropdownSelector
                setSelectedOption={setSelectedWeight}
                selectedOption={selectedWeight}
                label="Kg"
                options={Array.from({ length: 120 }, (_, i) => `${35 + i}`)}
              />
            </View>
          </View>
        </View>
        <View style={styles.actionButton}>
          <TouchableOpacity
            onPress={() => {
              updateWeight(selectedWeight);
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

export default WeightForm;

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
