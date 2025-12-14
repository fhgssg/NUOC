import {
  AntDesign,
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';

export type AccountOption = {
  label: string;
  value: string;
  icon: React.ReactNode;
  route?: string;
};

export const AccountOptionList: AccountOption[] = [
  {
    label: 'Thông tin sức khỏe',
    value: 'health_info',
    icon: <AntDesign size={22} name="user" color="#24A8CF" />,
    route: '/(routes)/editHealthInfo',
  },
  {
    label: 'Nhắc nhở uống nước',
    value: 'drink_reminder',
    icon: <MaterialIcons size={22} name="access-alarm" color="#24A8CF" />,
    route: '/(routes)/drinkReminder',
  },
  {
    label: 'Báo cáo',
    value: 'report',
    icon: <Feather size={22} name="bar-chart-2" color="#24A8CF" />,
    route: '/(tabs)/Report',
  },
];
