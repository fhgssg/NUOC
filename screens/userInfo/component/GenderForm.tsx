import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
import { FontContext } from '@/context/FontThemeContext';
import { GenderType } from '@/storage/userinfo/type';
import { ButtonTheme } from '@/style/ButtonTheme';
import { COLOR_THEME } from '@/style/ColorTheme';
import Icon from '@expo/vector-icons/FontAwesome';
import { ScreenDimension } from '@/constants/Dimensions';

type GenderFormProps = {
  initialValue?: GenderType;
  updateGender: (gender: string) => void;
};
const GenderForm = ({ initialValue, updateGender }: GenderFormProps) => {
  const { textTheme } = useContext(FontContext);
  const [gender, setGender] = useState(initialValue || 'male');
  return (
    <View style={[styles.container]}>
      <View style={{ flex: 1 }}>
        <View style={styles.form}>
          <Text style={[textTheme.heading3, styles.title]}>
            Giới tính của bạn là gì
          </Text>
          <Text style={[textTheme.subText, styles.title, { marginTop: 10 }]}>
            Water Mate ở đây để tùy chỉnh kế hoạch hydrat hóa của bạn! Hãy bắt đầu bằng cách tìm hiểu bạn tốt hơn.
          </Text>
          <View style={styles.genderButtonContainer}>
            <View>
              <TouchableOpacity
                onPress={() => setGender('male')}
                style={[
                  styles.genderButton,
                  {
                    backgroundColor:
                      gender === 'male' ? COLOR_THEME.base.primary : '#fff',
                  },
                ]}>
                <Icon
                  name="male"
                  color={gender === 'male' ? '#fff' : '#333'}
                  size={ScreenDimension.scale(50)}
                />
              </TouchableOpacity>
              <View style={{ marginTop: 20 }}>
                <Text
                  style={[
                    textTheme.subText,
                    {
                      textAlign: 'center',
                      color:
                        gender === 'male'
                          ? COLOR_THEME.base.primary
                          : '#888888',
                    },
                  ]}>
                  Nam
                </Text>
              </View>
            </View>
            <View>
              <TouchableOpacity
                onPress={() => setGender('female')}
                style={[
                  styles.genderButton,
                  {
                    backgroundColor:
                      gender === 'female' ? COLOR_THEME.base.primary : '#fff',
                  },
                ]}>
                <Icon
                  name="female"
                  color={gender === 'female' ? '#fff' : '#333'}
                  size={ScreenDimension.scale(50)}
                />
              </TouchableOpacity>
              <View style={{ marginTop: 20 }}>
                <Text
                  style={[
                    textTheme.subText,
                    {
                      textAlign: 'center',
                      color:
                        gender === 'female'
                          ? COLOR_THEME.base.primary
                          : '#888888',
                    },
                  ]}>
                  Nữ
                </Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity
              style={[
                styles.notToSayButton,
                {
                  backgroundColor:
                    gender === 'preferNotToSay'
                      ? COLOR_THEME.base.primary
                      : '#fff',
                },
              ]}
              onPress={() => setGender('preferNotToSay')}>
              <Text
                style={[
                  textTheme.subText,
                  {
                    color: gender === 'preferNotToSay' ? '#fff' : '#333',
                  },
                ]}>
                Không muốn nói
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.actionButton}>
          <TouchableOpacity
            onPress={() => {
              updateGender(gender);
            }}
            style={[ButtonTheme.containedButton, { width: '90%' }]}>
            <Text style={textTheme.buttonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default GenderForm;

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
    gap: ScreenDimension.scale(20),
    justifyContent: 'center',
    marginTop: ScreenDimension.scale(30),
    flexWrap: 'wrap',
  },
  genderButton: {
    height: ScreenDimension.scale(100),
    width: ScreenDimension.scale(100),
    borderRadius: ScreenDimension.scale(50),
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ccc',
  },
  notToSayButton: {
    borderWidth: 1,
    paddingHorizontal: ScreenDimension.scale(25),
    paddingVertical: ScreenDimension.scale(10),
    borderRadius: 80,
    marginTop: ScreenDimension.scale(30),
    borderColor: '#ccc',
  },
});
