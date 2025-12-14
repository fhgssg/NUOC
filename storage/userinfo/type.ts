import { ByDefaultCupsOptionsType } from '@/screens/homepage/type';

// --- CÁC KIỂU DỮ LIỆU GỐC (Dùng cho Form/UI) ---

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
  drinkType?: string; // Loại đồ uống (water, coffee, tea, etc.)
  defaultCupId?: number; // ID của cup được chọn
};

// Loại bỏ UserInfoType (cũ) và thay thế bằng UserInfo (mới)

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


// --- CÁC INTERFACE MỚI CHO FIREBASE/CONTEXT ---

/**
 * UserInfo (Dùng cho Context và Firestore)
 * Cấu trúc đơn giản, flat, và đã chuyển đổi sang kiểu number để tính toán.
 */
export interface UserInfo {
  userId: string; // FIX: ID được Firebase Auth cung cấp
  name: string;
  gender: GenderType | 'Other'; // Thống nhất kiểu dữ liệu
  height: number; // Chuyển từ string (Form) sang number (Context/Firestore)
  weight: number; // Chuyển từ string sang number
  age: number;    // Chuyển từ string sang number
  // Tên trường được chuẩn hóa để khớp với tính toán
  wakeUpTime: string;
  bedTime: string;
  activity: ActivityLevelType;
  climate: ClimateType;

  dailyGoal: number; // Mục tiêu nước hàng ngày (chỉ ML)
  dailyIntake: number; // Tổng lượng nước uống hôm nay (ML)
  lastResetDate?: string; // Ngày cuối cùng reset dailyIntake (YYYY-MM-DD)
  isCompleted: boolean; // Trạng thái Onboarding
  cupSize: number; // Mặc định 200ml
}

/**
 * DrinkLog (Dùng cho Firestore - Collection 'drink_logs')
 */
export interface DrinkLog {
  logId: string; // Document ID của Firestore
  userId: string; // Liên kết với người dùng
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  volume: number; // Lượng nước (ML)
  drinkType: string;
  defaultCupId?: number; // ID của cup được chọn (optional để tương thích với dữ liệu cũ)
  createdAt: number; // Timestamp để sắp xếp
}

/**
 * AuthState (Dùng cho Context mới)
 */
export interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean; // Vừa đăng ký Firebase nhưng chưa hoàn tất Onboarding
}