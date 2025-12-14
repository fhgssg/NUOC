import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  FlatList,
} from 'react-native';
import React, {useContext, useState, useEffect} from 'react';
import {ScreenDimension} from '@/constants/Dimensions';
import SafeModal from '@/components/modal/SafeModal';
import {Fontisto} from '@expo/vector-icons';
import {FontContext} from '@/context/FontThemeContext';
import {
  ByDefaultCupsOptions,
  ByDrinikingOptions,
} from '@/constants/OptionConstant';
import {FlatGrid} from 'react-native-super-grid';
import {ByDefaultCupsOptionsType} from '../type';
import UpdateDrinkModalForm from './UpdateDrinkModalForm';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type SwitchCupSIzeModalProps = {
  openModal: boolean;
  handleClose: () => void;
  selectedCupSizeId: number;
  handleUpdateSelectCup: (selectedCup: ByDefaultCupsOptionsType) => void;
};
const SwitchCupSIzeModal = ({
  openModal,
  handleClose,
  selectedCupSizeId,
  handleUpdateSelectCup,
}: SwitchCupSIzeModalProps) => {
  const {textTheme} = useContext(FontContext);
  const [selectedDrink, setSelectedDrink] =
    useState<ByDefaultCupsOptionsType | null>(null);
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;

  // Reset selectedDrink khi modal đóng
  useEffect(() => {
    if (!openModal) {
      setSelectedDrink(null);
    }
  }, [openModal]);

  // Tính chiều cao modal: từ bottom đến top (full screen)
  const modalHeight = screenHeight - insets.top;

  return (
    <SafeModal
      isVisible={openModal}
      onBackButtonPress={() => {
        handleClose();
        return true; // Prevent default back button behavior
      }}
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
      <View style={[styles.container, {height: modalHeight, paddingTop: insets.top}]}>
        <View style={styles.headerView}>
          <TouchableOpacity 
            onPress={() => {
              setSelectedDrink(null);
              handleClose();
            }} 
            style={styles.icon}>
            <Fontisto name={'close-a'} size={ScreenDimension.scale(20)} />
          </TouchableOpacity>
          <Text
            style={[textTheme.heading3, {width: '100%', textAlign: 'center'}]}>
            Chọn Kích Thước Cốc
          </Text>
        </View>
        <FlatList
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          data={[
            {type: 'default', data: ByDefaultCupsOptions},
            {type: 'drinking', data: ByDrinikingOptions},
          ]}
          keyExtractor={(item, index) => `section-${index}`}
          renderItem={({item: section}) => (
            <View style={styles.deafultCupContainer}>
              <FlatGrid
                itemDimension={ScreenDimension.scale(80)}
                data={section.data}
                style={styles.gridView}
                spacing={ScreenDimension.scale(10)}
                staticDimension={Dimensions.get('window').width - (ScreenDimension.horizontalPadding * 2)}
                scrollEnabled={false}
                renderItem={({item}) => (
                  <View style={styles.itemContainer} key={item.id}>
                    <View style={styles.itemContent}>
                      <TouchableOpacity
                        onPress={() => {
                          if (section.type === 'default') {
                            handleUpdateSelectCup(item);
                          } else {
                            setSelectedDrink(item);
                          }
                        }}
                        style={[
                          styles.cupButtonContainer,
                          {
                            backgroundColor:
                              selectedCupSizeId === item.id ? '#EEF7FF' : '#fff',
                          },
                        ]}>
                        <Image
                          resizeMode="contain"
                          source={item.icon}
                          style={{
                            height: ScreenDimension.scale(40),
                            width: ScreenDimension.scale(40),
                          }}
                        />
                      </TouchableOpacity>
                      <Text
                        numberOfLines={section.type === 'drinking' ? 2 : undefined}
                        style={[
                          textTheme.subText,
                          styles.drinkTitle,
                        ]}>
                        {item.title}
                      </Text>
                    </View>
                  </View>
                )}
              />
              {section.type === 'drinking' && selectedDrink && (
                <UpdateDrinkModalForm
                  handleClose={() => setSelectedDrink(null)}
                  drinkInfo={selectedDrink}
                  openModal={!!selectedDrink}
                  updateCapacityIntake={value => {
                    try {
                      // Validate selectedDrink trước khi sử dụng
                      if (!selectedDrink) {
                        console.error('Selected drink is null');
                        return;
                      }
                      
                      // Kiểm tra tất cả thuộc tính cần thiết
                      if (!selectedDrink.icon || !selectedDrink.title || selectedDrink.id === undefined || selectedDrink.id === null) {
                        console.error('Invalid drink info - missing required properties');
                        return;
                      }
                      
                      // Validate giá trị số
                      const trimmedValue = String(value).trim();
                      if (!trimmedValue || trimmedValue === '') {
                        console.error('[ERROR] Empty value provided');
                        return;
                      }
                      
                      const numValue = Number(trimmedValue);
                      if (isNaN(numValue) || numValue <= 0 || !isFinite(numValue)) {
                        console.error('[ERROR] Invalid number value:', trimmedValue);
                        return;
                      }
                      
                      // Tạo object mới với tất cả thuộc tính cần thiết
                      const updatedCup: ByDefaultCupsOptionsType = {
                        icon: selectedDrink.icon,
                        title: selectedDrink.title,
                        id: selectedDrink.id,
                        value: numValue,
                      };
                      
                      // Đóng modal UpdateDrinkModalForm trước
                      setSelectedDrink(null);
                      
                      // Gọi callback với object đã được validate
                      // Sử dụng setTimeout để đảm bảo modal đã đóng hoàn toàn trước khi cập nhật
                      setTimeout(() => {
                        try {
                          if (handleUpdateSelectCup && updatedCup) {
                            handleUpdateSelectCup(updatedCup);
                          } else {
                            console.error('handleUpdateSelectCup is missing or updatedCup is invalid');
                          }
                        } catch (error) {
                          console.error('[ERROR] Error calling handleUpdateSelectCup:', error);
                          console.error('[ERROR] Stack:', error instanceof Error ? error.stack : 'No stack');
                        }
                      }, 100);
                    } catch (error) {
                      console.error('[ERROR] Error in updateCapacityIntake:', error);
                      console.error('[ERROR] Stack:', error instanceof Error ? error.stack : 'No stack');
                      // Đảm bảo modal được đóng ngay cả khi có lỗi
                      setSelectedDrink(null);
                    }
                  }}
                />
              )}
            </View>
          )}
        />
      </View>
    </SafeModal>
  );
};

export default SwitchCupSIzeModal;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingBottom: ScreenDimension.verticalPadding * 1.5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: ScreenDimension.verticalPadding,
  },
  itemContainer: {
    padding: ScreenDimension.scale(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  drinkTitle: {
    textAlign: 'center', 
    color: '#333', 
    marginTop: ScreenDimension.scale(10),
    fontSize: ScreenDimension.fontScale(12),
    width: '100%',
  },
  headerView: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ScreenDimension.verticalPadding,
    marginBottom: ScreenDimension.verticalPadding,
    justifyContent: 'space-between',
    position: 'relative',
    width: '100%',
    paddingHorizontal: ScreenDimension.horizontalPadding,
  },
  gridView: {
    marginTop: ScreenDimension.verticalPadding,
    flex: 1,
  },
  icon: {
    position: 'absolute',
    left: ScreenDimension.horizontalPadding,
    zIndex: 999,
  },
  cupButtonContainer: {
    height: ScreenDimension.scale(65),
    width: ScreenDimension.scale(65),
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#efefef',
    borderWidth: 1,
    position: 'relative',
  },
  deafultCupContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    paddingHorizontal: ScreenDimension.horizontalPadding,
  },
});
