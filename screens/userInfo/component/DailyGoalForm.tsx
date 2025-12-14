import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useContext, useState } from 'react';
import { FontContext } from '@/context/FontThemeContext';
import { DailyGoalType, WaterLevelType } from '@/storage/userinfo/type';
import { ButtonTheme } from '@/style/ButtonTheme';
import ButtonTabOptions from '@/components/container/ButtonTabOptions';
import UpdateDailyWaterIntakeForm from './UpdateDailyWaterIntakeForm';
import { EvilIcons } from '@expo/vector-icons';

type DailyGoalFormProps = {
  initialValue?: DailyGoalType;
  updateDailyGoal: (dailyGoal: DailyGoalType) => void;
  submitAllInfo: (dailyGoalValue?: number) => void | Promise<void>;
};

const DailyGoalForm = ({
  initialValue,
  submitAllInfo,
  updateDailyGoal,
}: DailyGoalFormProps) => {
  const { textTheme } = useContext(FontContext);
  const [dailyGoal, setDailyGoal] = useState<DailyGoalType>(
    initialValue || {
      type: 'ml',
      value: 0,
    },
  );
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  return (
    <View style={[styles.container]}>
      <View style={{ flex: 1 }}>
        <View style={styles.form}>
          <Text style={[textTheme.heading3, styles.title]}>
            Mục tiêu hàng ngày của bạn
          </Text>

          <View style={styles.contentContainer}>
            <View style={styles.buttonTabContainer}>
              <ButtonTabOptions
                handleOptionSelect={type => {
                  setDailyGoal(prev => ({
                    ...prev,
                    type: type as WaterLevelType,
                  }));
                }}
                selectedOption={dailyGoal.type}
                options={[
                  {
                    label: 'ML',
                    value: 'ml',
                  },
                  {
                    label: 'L',
                    value: 'L',
                  },
                ]}
              />
            </View>
            <View style={styles.imageContainer}>
              <Image
                source={require('@/assets/images/glassOfWater.png')}
                resizeMethod="resize"
                resizeMode="contain"
                style={styles.waterImage}
              />
            </View>
            <View style={styles.valueContainer}>
              <Text style={[textTheme.heading1, styles.valueText]}>
                {String(dailyGoal.type === 'L'
                  ? (dailyGoal.value || 0) / 1000
                  : (dailyGoal.value || 0))}{' '}
                <Text style={[textTheme.subText, styles.unitText]}>
                  {dailyGoal.type || 'ml'}
                </Text>
              </Text>
              <View style={styles.adjustButtonContainer}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => setOpenUpdateModal(true)}>
                  <View style={styles.adjustButtonContent}>
                    <EvilIcons name="pencil" size={20} color="#333" />
                    <Text style={[textTheme.subText, styles.adjustButtonText]}>
                      Điều chỉnh
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <UpdateDailyWaterIntakeForm
                openModal={openUpdateModal}
                handleClose={() => setOpenUpdateModal(false)}
                initialValue={
                  initialValue || {
                    type: 'ml',
                    value: 0,
                  }
                }
                updateDailyIntake={value => {
                  // Chuyển đổi từ L sang ml nếu cần
                  const valueInMl = value.type === 'L' ? value.value * 1000 : value.value;
                  const updatedValue = { ...value, value: valueInMl, type: 'ml' as const };
                  updateDailyGoal(updatedValue);
                  setDailyGoal(updatedValue);
                  setOpenUpdateModal(false);
                }}
              />
            </View>
          </View>
        </View>
        <View style={styles.actionButton}>
          <TouchableOpacity
            onPress={async () => {
              try {
                // Chuyển đổi giá trị sang ml nếu đang dùng L
                const goalInMl = dailyGoal.type === 'L' ? dailyGoal.value * 1000 : dailyGoal.value;
                // Đảm bảo có giá trị hợp lệ
                const finalGoal = goalInMl > 0 ? goalInMl : (initialValue?.value || 2000);
                // Cập nhật dailyGoal trong parent component
                updateDailyGoal({ value: finalGoal, type: 'ml' });
                // Truyền giá trị trực tiếp vào submitAllInfo
                await submitAllInfo(finalGoal);
              } catch (error) {
                console.error('Error in Let\'s Hydrate button:', error);
              }
            }}
            style={[ButtonTheme.containedButton, { width: '90%' }]}>
            <Text style={textTheme.buttonText}>Bắt đầu hydrat hóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DailyGoalForm;

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'grey',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    flex: 7,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    textAlign: 'center',
  },
  contentContainer: {
    marginTop: 30,
    overflow: 'hidden',
    flex: 1,
  },
  buttonTabContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  imageContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  waterImage: {
    height: 100,
    width: 100,
    aspectRatio: 1,
  },
  valueContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  valueText: {
    fontSize: 53,
    textAlign: 'center',
  },
  unitText: {
    fontSize: 28,
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
  adjustButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  adjustButton: {
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 30,
    paddingVertical: 8,
    width: 'auto',
  },
  adjustButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adjustButtonText: {
    fontSize: 16,
  },
});
