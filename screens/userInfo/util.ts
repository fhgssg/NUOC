import {
  ActivityLevelType,
  ClimateType,
  GenderType,
} from '@/storage/userinfo/type';
import { ActivityOptionType, ClimateOptionType } from './type';

export const ActivityLevelOptions: ActivityOptionType[] = [
  {
    icon: require('@/assets/images/activity/lazy.png'),
    title: 'Ít vận động',
    description: 'Hoạt động thể chất hạn chế, chủ yếu ngồi hoặc nằm',
    id: 'sendatry',
  },
  {
    icon: require('@/assets/images/activity/walking.png'),
    title: 'Hoạt động nhẹ',
    description:
      'Một số vận động trong ngày. Chẳng hạn như đi bộ nhẹ hoặc thỉnh thoảng đứng.',
    id: 'light_activity',
  },
  {
    icon: require('@/assets/images/activity/running.png'),
    title: 'Hoạt Động Vừa Phải',
    description:
      'Tập thể dục hoặc hoạt động thể chất thường xuyên, chẳng hạn như chạy bộ hoặc đạp xe.',
    id: 'moderate_activity',
  },
  {
    icon: require('@/assets/images/activity/lifting.png'),
    title: 'Rất năng động',
    description:
      'Hoạt động thể chất hoặc tập luyện cường độ cao, chẳng hạn như nâng tạ nặng hoặc tập luyện cường độ cao',
    id: 'very_active',
  },
];

export const ClimateOptions: ClimateOptionType[] = [
  {
    icon: require('@/assets/images/climate/sun.png'),
    title: 'Nóng',
    id: 'hot',
  },
  {
    icon: require('@/assets/images/climate/temperate.png'),
    title: 'Ôn hòa',
    id: 'temperate',
  },
  {
    icon: require('@/assets/images/climate/cold.png'),
    title: 'Lạnh',
    id: 'cold',
  },
];

interface WaterIntakeInput {
  weight: number; // in kg
  height: number; // in cm
  age: number;
  gender: GenderType;
  activityLevel: ActivityLevelType;
  wakeUpTime: string; // 'HH:MM' format (24-hour)
  sleepTime: string; // 'HH:MM' format (24-hour)
  weather: ClimateType;
}

export const calculateWaterIntake = ({
  weight,
  height,
  age,
  gender,
  activityLevel,
  wakeUpTime,
  sleepTime,
  weather,
}: WaterIntakeInput): number => {
  // Base water requirement based on weight
  let waterIntake = weight * 0.035; // 35ml per kg of weight

  // Gender adjustment
  if (gender === 'male') {
    waterIntake += 0.5; // Men generally need more water
  } else if (gender === 'female') {
    waterIntake += 0.3; // Women need slightly less
  } else {
    waterIntake += 0.5;
  }

  // Height adjustment
  if (height > 175) {
    waterIntake += 0.3; // Taller people need more water
  } else if (height < 160) {
    waterIntake -= 0.2; // Shorter people need slightly less water
  }
  // Activity level adjustment
  switch (activityLevel) {
    case 'light_activity':
      waterIntake += 0.3;
      break;
    case 'moderate_activity':
      waterIntake += 0.5;
      break;
    case 'very_active':
      waterIntake += 1;
      break;
    case 'sendatry':
    default:
      break; // No change for sedentary
  }

  // Age adjustment
  if (age > 30 && age <= 55) {
    waterIntake -= 0.2;
  } else if (age > 55) {
    waterIntake -= 0.4;
  }

  // Weather adjustment
  switch (weather) {
    case 'hot':
      waterIntake += 0.7;
      break;
    case 'cold':
      waterIntake -= 0.3;
      break;
    case 'temperate':
    default:
      break; // No change for temperate weather
  }

  // Calculate total awake hours
  const wakeHour = parseInt(wakeUpTime.split(':')[0]);
  const sleepHour = parseInt(sleepTime.split(':')[0]);
  const totalAwakeHours =
    sleepHour > wakeHour ? sleepHour - wakeHour : 24 - wakeHour + sleepHour;

  // Adjust based on awake time
  if (totalAwakeHours > 16) {
    waterIntake += 0.5; // Increase water intake if awake more than 16 hours
  } else if (totalAwakeHours < 12) {
    waterIntake -= 0.3; // Decrease if awake less than 12 hours
  }

  // Ensure minimum water intake is at least 1 liter
  if (waterIntake < 1) {
    waterIntake = 1;
  }
  // Ensure minimum water intake is at least 1 liter
  if (waterIntake < 1) {
    waterIntake = 1;
  }

  // Convert from liters to milliliters
  const waterIntakeInMl = waterIntake * 1000;

  return Math.round(waterIntakeInMl); // Return result rounded to nearest milliliter
};
