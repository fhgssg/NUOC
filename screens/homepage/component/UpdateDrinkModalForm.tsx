import { Image, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import SafeModal from '@/components/modal/SafeModal';
import { ScreenDimension } from '@/constants/Dimensions';
import { FontContext } from '@/context/FontThemeContext';
import CommonTextInput from '@/components/field/CommonTextInput';
import { ButtonTheme } from '@/style/ButtonTheme';
import { COLOR_THEME } from '@/style/ColorTheme';
import { ByDefaultCupsOptionsType } from '../type';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type UpdateDrinkModalFormProps = {
  openModal: boolean;
  handleClose: () => void;
  updateCapacityIntake: (value: string) => void;
  drinkInfo: ByDefaultCupsOptionsType;
};
const UpdateDrinkModalForm = ({
  openModal,
  updateCapacityIntake,
  handleClose,
  drinkInfo,
}: UpdateDrinkModalFormProps) => {
  const { textTheme } = useContext(FontContext);
  const [newAmount, setNewAmount] = useState<string>('0');
  const [isVisible, setIsVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;

  // Đồng bộ isVisible với openModal để tránh lỗi unmount
  useEffect(() => {
    if (openModal) {
      setIsVisible(true);
    } else {
      // Delay việc ẩn modal để animation hoàn thành
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [openModal]);

  // Cập nhật giá trị khi drinkInfo thay đổi hoặc modal mở
  useEffect(() => {
    if (openModal && drinkInfo) {
      const value = drinkInfo?.value ?? 0;
      setNewAmount(value.toString());
    }
  }, [openModal, drinkInfo]);

  // Kiểm tra an toàn: nếu không có drinkInfo, không render modal
  if (!drinkInfo || !isVisible) {
    return null;
  }

  // Tính chiều cao modal: từ bottom đến top (full screen)
  const modalHeight = screenHeight - insets.top;

  const handleModalClose = () => {
    setIsVisible(false);
    handleClose();
  };

  return (
    <SafeModal
      isVisible={openModal && isVisible}
      onBackdropPress={handleModalClose}
      onBackButtonPress={() => {
        handleModalClose();
        return true; // Prevent default back button behavior
      }}
      swipeDirection="down"
      onSwipeComplete={handleModalClose}
      animationIn="bounceInUp"
      animationOut="bounceOutDown"
      animationInTiming={900}
      animationOutTiming={500}
      backdropTransitionInTiming={1000}
      backdropTransitionOutTiming={500}
      useNativeDriverForBackdrop={false}
      hideModalContentWhileAnimating={true}
      avoidKeyboard={false}
      style={{
        justifyContent: 'flex-end',
        margin: 0,
      }}>
      <View
        style={{
          height: modalHeight,
          backgroundColor: '#F5F5F5',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            paddingTop: insets.top + ScreenDimension.verticalPadding * 0.5,
            paddingBottom: ScreenDimension.verticalPadding * 0.5 + 20,
            borderBottomColor: '#ccc',
            borderBottomWidth: 1,
            backgroundColor: '#fff',
            paddingHorizontal: ScreenDimension.horizontalPadding,
            width: '100%',
            minHeight: 60 + insets.top,
            justifyContent: 'center',
          }}>
          <Text style={[
            textTheme.heading3,
            {
              textAlign: 'center',
              fontSize: ScreenDimension.fontScale(18),
            }
          ]}>
            Cập nhật {drinkInfo?.title || 'Đồ uống'}
          </Text>
        </View>
        <View style={[styles.container, { marginTop: ScreenDimension.verticalPadding * 2, width: '100%', backgroundColor: '#fff', flex: 1, paddingBottom: insets.top }]}>
          <View style={[styles.form, { width: '100%' }]}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginBottom: ScreenDimension.verticalPadding * 2.5,
                paddingHorizontal: ScreenDimension.horizontalPadding,
              }}>
              {drinkInfo?.icon && (
                <Image
                  resizeMode="contain"
                  source={drinkInfo.icon}
                  style={{
                    height: ScreenDimension.scale(100),
                    width: ScreenDimension.scale(100),
                  }}
                />
              )}
            </View>
            <View style={{ paddingHorizontal: ScreenDimension.horizontalPadding }}>
              <CommonTextInput
                handleChangeText={setNewAmount}
                value={newAmount}
                endAdorment="mL"
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={[styles.actionButton, { width: '100%', backgroundColor: '#fff', marginTop: ScreenDimension.verticalPadding * 2 }]}>
            <TouchableOpacity
              onPress={handleModalClose}
              style={[ButtonTheme.outlinedButton, { width: '45%' }]}>
              <Text
                style={[
                  textTheme.buttonText,
                  { color: COLOR_THEME.base.primary },
                ]}>
                Đóng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                try {
                  // Validate: đảm bảo giá trị là số hợp lệ và > 0
                  if (!drinkInfo) {
                    console.error('Drink info is missing');
                    handleModalClose();
                    return;
                  }

                  if (!updateCapacityIntake) {
                    console.error('updateCapacityIntake callback is missing');
                    handleModalClose();
                    return;
                  }

                  const trimmedAmount = newAmount.trim();
                  if (!trimmedAmount || trimmedAmount === '') {
                    return;
                  }

                  const numValue = Number(trimmedAmount);
                  if (!isNaN(numValue) && numValue > 0 && isFinite(numValue)) {
                    // Gọi callback trước khi đóng modal
                    updateCapacityIntake(trimmedAmount);
                    // Đóng modal sau
                    handleModalClose();
                  } else {
                    console.error('Invalid number value:', trimmedAmount);
                  }
                } catch (error) {
                  console.error('[ERROR] Error updating capacity intake:', error);
                  console.error('[ERROR] Stack:', error instanceof Error ? error.stack : 'No stack');
                  // Đảm bảo modal được đóng ngay cả khi có lỗi
                  handleModalClose();
                }
              }}
              style={[ButtonTheme.containedButton, { width: '45%' }]}>
              <Text style={textTheme.buttonText}>Tiếp tục</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeModal>
  );
};

export default UpdateDrinkModalForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    borderTopWidth: 1,
    gap: ScreenDimension.scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: ScreenDimension.verticalPadding,
    paddingBottom: ScreenDimension.verticalPadding,
    borderTopColor: '#ccc',
    paddingHorizontal: ScreenDimension.horizontalPadding,
    marginTop: 0,
  },
  form: {
    flex: 1,
    paddingTop: 0,
  },
});
