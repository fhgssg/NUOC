import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { FontContext } from '@/context/FontThemeContext';
import { ButtonTheme } from '@/style/ButtonTheme';
import DropdownSelector from './DropdownSelector';
import { GenderType } from '@/storage/userinfo/type';

type HeightFormProps = {
  initialValue?: string;
  updateHeight: (height: string) => void;
  gender?: GenderType;
};
const HeightForm = ({ updateHeight, initialValue, gender }: HeightFormProps) => {
  const { textTheme } = useContext(FontContext);
  const [selectedHeight, setSelectedHeight] = useState<string>(
    initialValue || '185',
  );
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
            Chiều cao của bạn là bao nhiêu?
          </Text>
          <Text style={[textTheme.subText, styles.title, { marginTop: 10 }]}>
            Chiều cao của bạn là một yếu tố quan trọng khác trong việc tùy chỉnh kế hoạch hydrat hóa của bạn. Chọn chiều cao của bạn:
          </Text>
          <View style={styles.heightContainer}>
            <View style={styles.imageView}>
              <Image
                source={
                  gender === 'male'
                    ? require(`@/assets/images/sizes/fit.png`)
                    : require('@/assets/images/sizes/girl_fit.png')
                }
                resizeMode="contain"
                style={{
                  height: '100%',
                  width: '100%',
                }}
              />
            </View>
            <View style={styles.heightSelect}>
              <DropdownSelector
                setSelectedOption={setSelectedHeight}
                selectedOption={selectedHeight}
                label="cm"
                options={Array.from({ length: 100 }, (_, i) => `${150 + i}`)}
              />
            </View>
          </View>
        </View>
        <View style={styles.actionButton}>
          <TouchableOpacity
            onPress={() => {
              updateHeight(selectedHeight);
            }}
            disabled={disableButton}
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

export default HeightForm;

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
