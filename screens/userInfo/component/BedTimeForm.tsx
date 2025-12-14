import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { FontContext } from '@/context/FontThemeContext';
import { ButtonTheme } from '@/style/ButtonTheme';
import DropdownSelector from './DropdownSelector';
import { TimeType } from '@/storage/userinfo/type';

type BedTimeFormProps = {
  initialValue?: TimeType;
  updateBedTime: (time: TimeType) => void;
};
const BedTimeForm = ({ updateBedTime, initialValue }: BedTimeFormProps) => {
  const { textTheme } = useContext(FontContext);
  const [selectedBedTime, setSelectedBedTime] = useState<TimeType>(
    initialValue || {
      hrs: '20',
      min: '00',
    },
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
            Bạn thường đi ngủ lúc mấy giờ?
          </Text>
          <Text style={[textTheme.subText, styles.title, { marginTop: 10 }]}>
            Giờ đi ngủ của bạn ảnh hưởng đến mô hình hydrat hóa của bạn. Chọn giờ đi ngủ điển hình của bạn.
          </Text>
          <View style={styles.heightContainer}>
            <View style={styles.heightSelect}>
              <DropdownSelector
                setSelectedOption={value =>
                  setSelectedBedTime(prev => ({
                    min: prev.min,
                    hrs: value,
                  }))
                }
                selectedOption={selectedBedTime.hrs}
                label=""
                options={Array.from(
                  { length: 24 },
                  (_, i) => `${1 + i <= 9 ? '0' : ''}${1 + i}`,
                )}
              />
            </View>
            <View style={styles.heightSelect}>
              <DropdownSelector
                setSelectedOption={value =>
                  setSelectedBedTime(prev => ({
                    min: value,
                    hrs: prev.hrs,
                  }))
                }
                selectedOption={selectedBedTime.min}
                label={Number(selectedBedTime.hrs) > 11 ? 'CH' : 'SA'}
                options={Array.from(
                  { length: 61 },
                  (_, i) => `${i <= 9 ? '0' : ''}${i}`,
                )}
              />
            </View>
          </View>
        </View>
        <View style={styles.actionButton}>
          <TouchableOpacity
            onPress={() => {
              updateBedTime({
                hrs: selectedBedTime.hrs,
                min: selectedBedTime.min,
              });
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

export default BedTimeForm;

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
    gap: 20,
    justifyContent: 'center',
    // alignItems: 'center',
  },
  heightSelect: {
    // flex: 1,
  },
});
