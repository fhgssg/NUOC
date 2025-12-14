import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {IntakeHistoryType} from '@/storage/userinfo/type';
import {
  ByDefaultCupsOptions,
  ByDrinikingOptions,
} from '@/constants/OptionConstant';

// Hàm chuyển đổi drinkType code sang tên tiếng Việt
const getDrinkTypeName = (drinkType: string): string => {
  const drinkTypeMap: { [key: string]: string } = {
    'water': 'Nước',
    'coffee': 'Cà phê',
    'tea': 'Trà',
    'juice': 'Nước ép',
    'sportDrink': 'Nước thể thao',
    'coconutDrink': 'Nước dừa',
    'smoothie': 'Sinh tố',
    'chocolate': 'Sô cô la',
    'carbon': 'Nước có ga',
    'soda': 'Soda',
    'wine': 'Rượu vang',
    'beer': 'Bia',
    'liquor': 'Rượu mạnh',
    // Giữ lại mapping cho tên tiếng Việt đã có
    'Nước': 'Nước',
    'Cà phê': 'Cà phê',
    'Trà': 'Trà',
    'Nước ép': 'Nước ép',
    'Nước thể thao': 'Nước thể thao',
    'Nước dừa': 'Nước dừa',
    'Sinh tố': 'Sinh tố',
    'Sô cô la': 'Sô cô la',
    'Nước có ga': 'Nước có ga',
    'Soda': 'Soda',
    'Rượu vang': 'Rượu vang',
    'Bia': 'Bia',
    'Rượu mạnh': 'Rượu mạnh',
  };
  
  return drinkTypeMap[drinkType] || drinkType || 'Nước';
};

type HistoryCardProps = {
  intakeInfo: IntakeHistoryType;
  textTheme: any;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  handleHistoryDelete: (id: string) => void;
};

const HistoryCard = ({
  intakeInfo,
  textTheme,
  openMenuId,
  setOpenMenuId,
  handleHistoryDelete,
}: HistoryCardProps) => {
  const isMenuOpen = openMenuId === intakeInfo.id;

  const handleMenuToggle = () => {
    setOpenMenuId(isMenuOpen ? null : intakeInfo.id);
  };

  // Tìm cup data dựa trên defaultCupId
  let findCupData = null;
  if (intakeInfo.defaultCupId && intakeInfo.defaultCupId > 0) {
    findCupData = [...ByDefaultCupsOptions, ...ByDrinikingOptions].find(
      item => item.id === intakeInfo.defaultCupId,
    );
  }

  // Fallback: Nếu không tìm thấy cup, sử dụng cup mặc định (200ml) hoặc cup đầu tiên
  const displayCupData = findCupData || 
    ByDefaultCupsOptions.find(cup => cup.value === 200) || 
    ByDefaultCupsOptions.find(cup => cup.value === 250) ||
    ByDefaultCupsOptions[0] ||
    { icon: require('@/assets/images/glasses/cup_200.png') }; // Fallback cuối cùng

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Image 
          source={displayCupData.icon} 
          style={{height: 40, width: 40}} 
          resizeMode="contain"
        />
        <View>
          <Text style={[textTheme.subText, {fontSize: 18, color: '#333'}]}>
            {getDrinkTypeName(intakeInfo.drinkType || 'water')}
          </Text>
          <Text>{intakeInfo.time || ''}</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <View>
          <Text style={[textTheme.subText, {fontSize: 18, color: '#333'}]}>
            {String(intakeInfo.amount || 0)} ml
          </Text>
        </View>
        <View>
          <TouchableOpacity onPress={handleMenuToggle}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
      </View>
      {isMenuOpen && (
        <View style={styles.menuModal}>
          {/* <TouchableOpacity onPress={() => setOpenMenuId(null)}>
            <Text style={[textTheme.subText, {fontSize: 20, color: '#333'}]}>
              <MaterialCommunityIcons name="pencil" size={20} /> Edit
            </Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={{
              //   borderTopWidth: 1,
              //   borderTopColor: '#efefef',
              paddingTop: 10,
            }}
            onPress={() => {
              handleHistoryDelete(intakeInfo.id);
              setOpenMenuId(null);
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <MaterialCommunityIcons name="trash-can" size={20} color="#EA6230" />
              <Text style={[textTheme.subText, {fontSize: 20, color: '#EA6230'}]}>
                Xóa
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default HistoryCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#efefef',
    paddingBottom: 0,
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    gap: 10,
  },
  rightSection: {
    flexDirection: 'row',
    gap: 10,
  },
  menuModal: {
    position: 'absolute',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#333',
    minWidth: 120,
    borderRadius: 10,
    right: 30,
    zIndex: 999,
    backfaceVisibility: 'hidden',
  },
});
