import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useContext, useState} from 'react';
import {FontContext} from '@/context/FontThemeContext';
import {IntakeHistoryType} from '@/storage/userinfo/type';
import HistoryCard from './HistoryCard';

type WaterIntakeHistoryTodayProps = {
  todayHistoryList: IntakeHistoryType[];
  handleHistoryDelete: (id: string) => void;
  title?: string;
  hideLink?: boolean;
  noDataText?: string;
  noTopPadding?: boolean;
};
const WaterIntakeHistoryToday = ({
  todayHistoryList,
  handleHistoryDelete,
  hideLink = false,
  title,
  noDataText,
  noTopPadding = false,
}: WaterIntakeHistoryTodayProps) => {
  const {textTheme} = useContext(FontContext);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleOutsidePress = () => {
    setOpenMenuId(null);
  };
  const renderView = () => {
    if (todayHistoryList.length === 0) {
      return (
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <Image
              tintColor={'#EEF7FF'}
              source={require('@/assets/images/leaf.png')}
              style={{
                height: 100,
                width: 100,
                marginVertical: 30,
              }}
            />
          </View>

          <Text
            style={[
              textTheme.subText,
              {textAlign: 'center', marginBottom: 0},
            ]}>
            {noDataText || 'Bạn chưa có lịch sử uống nước hôm nay'}
          </Text>
        </View>
      );
    }

    return (
      <View>
        {todayHistoryList.map((item, index) => (
          <View key={item.id} style={{marginTop: index === 0 ? 0 : 10, paddingBottom: index === todayHistoryList.length - 1 ? 0 : 10}}>
            <HistoryCard
              handleHistoryDelete={handleHistoryDelete}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              textTheme={textTheme}
              intakeInfo={item}
            />
          </View>
        ))}
      </View>
    );
  };
  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={[styles.container, noTopPadding && {paddingTop: 0, marginTop: 0}]}>
        <View style={[styles.header, noTopPadding && {marginTop: 0, paddingTop: 0}]}>
          <Text style={textTheme.heading3}>{title || 'Lịch Sử'}</Text>
        </View>
        <View>{renderView()}</View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default WaterIntakeHistoryToday;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 0,
    marginTop: 0,
  },
  header: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginTop: 0,
    paddingTop: 0,
    marginBottom: 0,
  },
});
