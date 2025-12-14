import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { FontContext } from '@/context/FontThemeContext';
import { ButtonTheme } from '@/style/ButtonTheme';
import DropdownSelector from './DropdownSelector';
import { TimeType } from '@/storage/userinfo/type';

type WakeupTimeFormProps = {
  initialValue?: TimeType;
  updateWakeUpTime: (time: TimeType) => void;
};
const WakeupTimeForm = ({
  updateWakeUpTime,
  initialValue,
}: WakeupTimeFormProps) => {
  const { textTheme } = useContext(FontContext);
  const [selectedWakeUpTime, setSelectedWakeUpTime] = useState<TimeType>(
    initialValue || {
      hrs: '06',
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
            Bạn thường thức dậy lúc mấy giờ?
          </Text>
          <Text style={[textTheme.subText, styles.title, { marginTop: 10 }]}>
            Thời gian thức dậy của bạn giúp chúng tôi tùy chỉnh lịch trình hydrat hóa của bạn. Chọn giờ thức dậy của bạn.
          </Text>
          <View style={styles.heightContainer}>
            <View style={styles.heightSelect}>
              <DropdownSelector
                setSelectedOption={value =>
                  setSelectedWakeUpTime(prev => ({
                    min: prev.min,
                    hrs: value,
                  }))
                }
                selectedOption={selectedWakeUpTime.hrs}
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
                  setSelectedWakeUpTime(prev => ({
                    min: value,
                    hrs: prev.hrs,
                  }))
                }
                selectedOption={selectedWakeUpTime.min}
                label={Number(selectedWakeUpTime.hrs) > 11 ? 'CH' : 'SA'}
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
              updateWakeUpTime({
                hrs: selectedWakeUpTime.hrs,
                min: selectedWakeUpTime.min,
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

export default WakeupTimeForm;

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
