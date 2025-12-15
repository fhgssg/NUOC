import { ByDefaultCupsOptionsType } from '@/screens/homepage/type';

export type GenderType = 'male' | 'female' | 'preferNotToSay';
export type TimeType = {
  hrs: string;
  min: string;
};

export type ActivityLevelType =
  | 'sendatry'
  | 'light_activity'
  | 'moderate_activity'
  | 'very_active';

export type WaterLevelType = 'ml' | 'L';
export type DailyGoalType = {
  value: number;
  type: WaterLevelType;
};
export type ClimateType = 'hot' | 'temperate' | 'cold';
export type TodayIntakeType = {
  value: number;
  date: string;
  drinkType?: string;
  defaultCupId?: number;
};

export type AppStatusType = {
  isWalkthroughDone: boolean;
  userProfileCompleted: boolean;
  reminderActive: boolean;
};

export type DrinkType =
  | 'water'
  | 'coffee'
  | 'tea'
  | 'juice'
  | 'sportDrink'
  | 'coconutDrink'
  | 'smoothie'
  | 'chocolate'
  | 'carbon'
  | 'soda'
  | 'wine'
  | 'beer'
  | 'liquor';

export type IntakeHistoryType = {
  drinkType: string;
  date: string;
  time: string;
  amount: string;
  id: string;
  defaultCupId: number;
};

export type CalendarHistoryType = {
  date: string;
  totalAmount: number;
};

export interface UserInfo {
  userId: string;
  name: string;
  gender: GenderType | 'Other';
  height: number;
  weight: number;
  age: number;
  wakeUpTime: string;
  bedTime: string;
  activity: ActivityLevelType;
  climate: ClimateType;

  dailyGoal: number;
  dailyIntake: number;
  lastResetDate?: string;
  isCompleted: boolean;
  cupSize: number;
}

export interface DrinkLog {
  logId: string;
  userId: string;
  date: string;
  time: string;
  volume: number;
  drinkType: string;
  defaultCupId?: number;
  createdAt: number;
}

export interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
}