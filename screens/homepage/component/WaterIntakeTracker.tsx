import {Image, StyleSheet, Text, TouchableOpacity, View, Dimensions, ActivityIndicator} from 'react-native';
import React, {useContext, useState} from 'react';
import WaterDrop from './WaterDrop';
import {COLOR_THEME} from '@/style/ColorTheme';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {FontContext} from '@/context/FontThemeContext';
import {DailyGoalType, TodayIntakeType} from '@/storage/userinfo/type';
import {ButtonTheme} from '@/style/ButtonTheme';
import {ByDefaultCupsOptionsType} from '../type';
import {EvilIcons} from '@expo/vector-icons';
import SwitchCupSIzeModal from './SwitchCupSIzeModal';
import {formatedCurrentDate} from '@/util/SiteUtil';
import {ByDrinikingOptions} from '@/constants/OptionConstant';
import {ScreenDimension} from '@/constants/Dimensions';

// Hàm map title sang drinkType
const getDrinkTypeFromTitle = (title: string): string => {
  const titleToDrinkType: { [key: string]: string } = {
    'Cà phê': 'coffee',
    'Trà': 'tea',
    'Nước ép': 'juice',
    'Nước thể thao': 'sportDrink',
    'Nước dừa': 'coconutDrink',
    'Sinh tố': 'smoothie',
    'Sô cô la': 'chocolate',
    'Nước có ga': 'carbon',
    'Soda': 'soda',
    'Rượu vang': 'wine',
    'Bia': 'beer',
    'Rượu mạnh': 'liquor',
    // Giữ lại mapping cũ để tương thích ngược
    'Coffee': 'coffee',
    'Tea': 'tea',
    'Juice': 'juice',
    'Sports Drink': 'sportDrink',
    'Coconut Drink': 'coconutDrink',
    'Smoothie': 'smoothie',
    'Chocolate': 'chocolate',
    'Carbon': 'carbon',
    'Wine': 'wine',
    'Beer': 'beer',
    'Liquor': 'liquor',
  };
  return titleToDrinkType[title] || 'water';
};

// Kiểm tra xem cup có phải là đồ uống đặc biệt không
const isDrinkOption = (cupId: number): boolean => {
  return ByDrinikingOptions.some(drink => drink.id === cupId);
};

type WaterIntakeTrackerProps = {
  totalIntack: DailyGoalType;
  todayIntack: TodayIntakeType;
  updateTodayDrinkingTrack: (capacity: TodayIntakeType) => void | Promise<void>;
  defaultSelectedCup: ByDefaultCupsOptionsType;
  handleUpdateSelectCup: (selectedCup: ByDefaultCupsOptionsType) => void;
};
const WaterIntakeTracker = ({
  totalIntack,
  todayIntack,
  updateTodayDrinkingTrack,
  defaultSelectedCup,
  handleUpdateSelectCup,
}: WaterIntakeTrackerProps) => {
  const {textTheme} = useContext(FontContext);
  const [openSelectCupSizeModal, setOpenSelectCupSizeModal] = useState(false);
  const [currentSelectedCup, setCurrentSelectedCup] = useState<ByDefaultCupsOptionsType>(defaultSelectedCup);
  const [isLoading, setIsLoading] = useState(false);

  // Tính toán kích thước responsive cho circular progress
  const screenWidth = Dimensions.get('window').width;
  const progressSize = Math.min(screenWidth * 0.75, 280); // Max 280, responsive với màn hình
  const innerProgressSize = progressSize * 0.786; // ~220/280 ratio
  const progressWidth = ScreenDimension.scale(15);

  // Cập nhật currentSelectedCup khi defaultSelectedCup thay đổi
  React.useEffect(() => {
    setCurrentSelectedCup(defaultSelectedCup);
  }, [defaultSelectedCup]);

  return (
    <View style={styles.container}>
      <View
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'row',
        }}>
        <AnimatedCircularProgress
          size={progressSize}
          width={progressWidth}
          fill={totalIntack.value > 0 ? (todayIntack.value / totalIntack.value) * 100 : 0}
          rotation={210}
          arcSweepAngle={300}
          tintColor={COLOR_THEME.base.primary}
          backgroundColor="#efefef">
          {(fill: number) => (
            <AnimatedCircularProgress
              size={innerProgressSize}
              width={progressWidth}
              fill={0}
              rotation={210}
              dashedBackground={{
                width: 1,
                gap: 40,
              }}
              arcSweepAngle={300}
              style={{
                borderRadius: 50,
                display: 'flex',
              }}
              tintColor={'#efefef'}
              backgroundColor="#ccc">
              {() => <WaterDrop value={fill} />}
            </AnimatedCircularProgress>
          )}
        </AnimatedCircularProgress>
      </View>
      <View style={{position: 'relative', bottom: 50}}>
        <Text
          style={[
            textTheme.heading1,
            {
              textAlign: 'center',
            },
          ]}>
          {String(todayIntack.value || 0)}
        </Text>
        <Text
          style={[
            textTheme.subText,
            {
              textAlign: 'center',
            },
          ]}>
          /{String(totalIntack.value || 0)} {totalIntack.type || 'ml'}
        </Text>
      </View>
      <View style={styles.actionContainer}>
        <TouchableOpacity
          disabled={isLoading}
          onPress={async () => {
            if (isLoading) return;
            setIsLoading(true);
            try {
              const drinkType = isDrinkOption(currentSelectedCup.id) 
                ? getDrinkTypeFromTitle(currentSelectedCup.title)
                : 'water';
              await updateTodayDrinkingTrack({
                date: formatedCurrentDate(),
                value: currentSelectedCup.value,
                drinkType: drinkType,
                defaultCupId: currentSelectedCup.id,
              });
            } catch (error) {
              console.error('Error updating drinking track:', error);
            } finally {
              setIsLoading(false);
            }
          }}
          style={[
            ButtonTheme.containedButton, 
            {width: 'auto', opacity: isLoading ? 0.6 : 1},
          ]}>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={textTheme.buttonText}>
              Uống({currentSelectedCup.title})
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setOpenSelectCupSizeModal(true)}
          style={styles.cupButtonContainer}>
          <Image
            resizeMode="contain"
            source={currentSelectedCup.icon}
            style={{
              height: 40,
              width: 40,
            }}
          />
          <View style={styles.refreshIcon}>
            <EvilIcons size={16} name="refresh" />
          </View>
        </TouchableOpacity>
      </View>
      <SwitchCupSIzeModal
        selectedCupSizeId={currentSelectedCup.id}
        handleClose={() => setOpenSelectCupSizeModal(false)}
        openModal={openSelectCupSizeModal}
        handleUpdateSelectCup={cupDetail => {
          try {
            setCurrentSelectedCup(cupDetail);
            handleUpdateSelectCup(cupDetail);
            setOpenSelectCupSizeModal(false);
          } catch (error) {
            console.error('Error in WaterIntakeTracker handleUpdateSelectCup:', error);
            // Vẫn đóng modal ngay cả khi có lỗi
            setOpenSelectCupSizeModal(false);
            throw error;
          }
        }}
      />
    </View>
  );
};

export default WaterIntakeTracker;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: ScreenDimension.horizontalPadding,
    paddingTop: ScreenDimension.verticalPadding * 2,
    paddingBottom: ScreenDimension.verticalPadding,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    bottom: ScreenDimension.scale(30),
    gap: ScreenDimension.scale(20),
    flexWrap: 'wrap',
  },
  cupButtonContainer: {
    height: ScreenDimension.scale(50),
    width: ScreenDimension.scale(50),
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    position: 'relative',
  },
  refreshIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    height: ScreenDimension.scale(18),
    width: ScreenDimension.scale(18),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 60,
  },
});
