/* eslint-disable react-native/no-inline-styles */
import {ScrollView, TouchableWithoutFeedback, Keyboard} from 'react-native';
import React, {FC, ReactNode} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

type KeyboardAvoidingWrapperProps = {
  children: ReactNode;
};
const KeyboardAvoidingWrapper: FC<KeyboardAvoidingWrapperProps> = ({
  children,
}) => {
  return (
    <KeyboardAwareScrollView
      extraScrollHeight={80}
      style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <>{children}</>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAwareScrollView>
  );
};

export default KeyboardAvoidingWrapper;
