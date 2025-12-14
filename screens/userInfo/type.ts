import {ActivityLevelType, ClimateType} from '@/storage/userinfo/type';
import {ImageSourcePropType} from 'react-native';

export type ActivityOptionType = {
  icon: ImageSourcePropType;
  title: string;
  description: string;
  id: ActivityLevelType;
};

export type ClimateOptionType = {
  icon: ImageSourcePropType;
  title: string;
  id: ClimateType;
};
