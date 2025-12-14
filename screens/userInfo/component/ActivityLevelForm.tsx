import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import React, { useContext, useState } from 'react';
import { FontContext } from '@/context/FontThemeContext';
import { ActivityLevelType, GenderType } from '@/storage/userinfo/type';
import { ButtonTheme } from '@/style/ButtonTheme';
import { COLOR_THEME } from '@/style/ColorTheme';
import Icon from '@expo/vector-icons/FontAwesome';
import { ActivityLevelOptions } from '../util';
import CardComponent from '@/components/container/CardComponent';
import { ScreenDimension } from '@/constants/Dimensions';

type ActivityLevelFormProps = {
  initialValue?: ActivityLevelType;
  updateActivityLevel: (value: ActivityLevelType) => void;
};
const ActivityLevelForm = ({
  initialValue,
  updateActivityLevel,
}: ActivityLevelFormProps) => {
  const { textTheme } = useContext(FontContext);
  const [activityLevel, setActivityLevel] = useState(
    initialValue || 'moderate_activity',
  );
  return (
    <View style={[styles.container]}>
      <View style={{ flex: 1 }}>
        <View style={styles.form}>
          <Text style={[textTheme.heading3, styles.title]}>
            Mức độ hoạt động của bạn là gì?
          </Text>
          <Text style={[textTheme.subText, styles.title, { marginTop: 10 }]}>
            Hiểu mức độ hoạt động của bạn là điều quan trọng để tạo ra một kế hoạch hydrat hóa cá nhân hóa. Chọn tùy chọn mô tả tốt nhất mức độ hoạt động điển hình của bạn.
          </Text>
          <View style={{ flex: 1, overflow: 'hidden', marginTop: 10 }}>
            <FlatList
              data={ActivityLevelOptions}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              decelerationRate="fast"
              renderItem={({ item }) => (
                <CardComponent
                  key={item.id}
                  handleOptionSelect={() => setActivityLevel(item.id)}
                  icon={item.icon}
                  isSelected={item.id === activityLevel}
                  title={item.title}
                  description={item.description}
                />
              )}
            />
          </View>
        </View>
        <View style={styles.actionButton}>
          <TouchableOpacity
            onPress={() => {
              updateActivityLevel(activityLevel);
            }}
            style={[ButtonTheme.containedButton, { width: '90%' }]}>
            <Text style={textTheme.buttonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ActivityLevelForm;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    flex: 7,
    paddingHorizontal: ScreenDimension.horizontalPadding,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    borderTopWidth: 1,
    gap: ScreenDimension.scale(10),
    justifyContent: 'center',
    paddingHorizontal: ScreenDimension.horizontalPadding,
    paddingTop: ScreenDimension.scale(20),
    paddingBottom: ScreenDimension.scale(20),
    borderTopColor: '#ccc',
  },
  title: {
    textAlign: 'center',
  },
  genderButtonContainer: {
    flexDirection: 'row',
    gap: ScreenDimension.scale(30),
    justifyContent: 'center',
    marginTop: ScreenDimension.scale(30),
  },
  genderButton: {
    height: ScreenDimension.scale(120),
    width: ScreenDimension.scale(120),
    borderRadius: ScreenDimension.scale(60),
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ccc',
  },
  notToSayButton: {
    borderWidth: 1,
    paddingHorizontal: ScreenDimension.scale(30),
    paddingVertical: ScreenDimension.scale(10),
    borderRadius: 80,
    marginTop: ScreenDimension.scale(30),
    borderColor: '#ccc',
  },
});
