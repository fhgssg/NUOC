import { StyleSheet, Text, View } from 'react-native';
import React, { useContext, useEffect } from 'react';
import { FontContext } from '@/context/FontThemeContext';
import CircularProgressBar from '@/components/container/CircularProgressBar';
import { UserInfo } from '@/storage/userinfo/type';
import { calculateWaterIntake } from '../util';

type GeneratingPersonalisedFormProps = {
  personalisedPlanDone: (waterIntake: number) => void;
  userInfo: UserInfo | null;
};
const GeneratingPersonalisedForm = ({
  personalisedPlanDone,
  userInfo,
}: GeneratingPersonalisedFormProps) => {
  const { textTheme } = useContext(FontContext);

  if (!userInfo) {
    return (
      <View style={[styles.container]}>
        <View style={{ flex: 1 }}>
          <View style={styles.form}>
            <Text style={[textTheme.heading3, styles.title]}>
              Đã xảy ra lỗi, vui lòng quay lại và nhập giá trị
            </Text>
            <Text style={[textTheme.subText, styles.title, { marginTop: 10 }]}>
              Xin lỗi vì sự bất tiện..
            </Text>
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.container]}>
      <View style={{ flex: 1 }}>
        <View style={styles.form}>
          <Text style={[textTheme.heading3, styles.title]}>
            Đang tạo kế hoạch Hydrat hóa cá nhân hóa cho bạn...
          </Text>
          <Text style={[textTheme.subText, styles.title, { marginTop: 10 }]}>
            Vui lòng đợi..
          </Text>
          <View style={{ marginTop: 40 }}>
            <CircularProgressBar
              durationCompleted={() =>
                personalisedPlanDone(
                  calculateWaterIntake({
                    activityLevel: userInfo.activity as any,
                    age: userInfo.age,
                    gender: userInfo.gender as any,
                    height: userInfo.height,
                    sleepTime: userInfo.bedTime,
                    wakeUpTime: userInfo.wakeUpTime,
                    weather: userInfo.climate as any,
                    weight: userInfo.weight,
                  }),
                )
              }
              duration={3}
              strokeWidth={6}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default GeneratingPersonalisedForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    flex: 7,
    marginTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    textAlign: 'center',
  },
});
