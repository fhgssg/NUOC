import {IntakeHistoryType} from '@/storage/userinfo/type';

export const filterTodayIntakeHistory = (
  list: IntakeHistoryType[],
  date: string,
) => {
  if (!list) {
    return [];
  }
  const filtered = list.filter(item => item.date === date);
  // Sort by time descending (newest first) to ensure correct order
  return filtered.sort((a, b) => {
    const timeA = a.time || '00:00:00';
    const timeB = b.time || '00:00:00';
    const timePartsA = timeA.split(':').map(Number);
    const timePartsB = timeB.split(':').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (timePartsB[i] !== timePartsA[i]) {
        return timePartsB[i] - timePartsA[i]; // Descending order (newest first)
      }
    }
    return 0;
  });
};
