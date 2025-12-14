import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
import { FontContext } from '@/context/FontThemeContext';
import { ButtonTheme } from '@/style/ButtonTheme';
import CommonTextInput from '@/components/field/CommonTextInput';
import { ScreenDimension } from '@/constants/Dimensions';

type UserNameFormProps = {
  updateName: (name: string) => void;
  initialValue?: string;
};
const UserNameForm = ({ updateName, initialValue }: UserNameFormProps) => {
  const { textTheme } = useContext(FontContext);
  const [name, setName] = useState(initialValue || '');
  return (
    <View style={[styles.container]}>
      <View style={{ flex: 1 }}>
        <View style={styles.form}>
          <Text style={[textTheme.heading3, styles.title]}>
            Chúng tôi nên gọi bạn là gì?
          </Text>
          <Text style={[textTheme.subText, styles.title, { marginTop: 10 }]}>
            Cho chúng tôi biết tên của bạn, và chúng tôi sẽ giúp bạn giữ nước!
            Cá nhân hóa trải nghiệm của bạn và biến nó thành của riêng bạn.
          </Text>
          <View style={{ marginTop: 20 }}>
            <CommonTextInput
              placeholder="Nhập tên của bạn"
              handleChangeText={setName}
              placeholderTextColor={'#ccc'}
              value={name}
            />
          </View>
        </View>
        <View style={styles.actionButton}>
          <TouchableOpacity
            disabled={name === ''}
            onPress={() => {
              updateName(name);
            }}
            style={[
              ButtonTheme.containedButton,
              { width: '90%' },
              name === '' && ButtonTheme.disableButtom,
            ]}>
            <Text style={textTheme.buttonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default UserNameForm;

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
});
