import {CalendarHistoryType, IntakeHistoryType} from '@/storage/userinfo/type';

export const transformDataInto = (
  list: IntakeHistoryType[],
): CalendarHistoryType[] => {
  if (!list) {
    return [];
  }
  const dateMap = list.reduce((acc, item) => {
    const date = item.date;
    const amount = parseFloat(item.amount);

    if (acc[date]) {
      acc[date] += amount;
    } else {
      acc[date] = amount;
    }

    return acc;
  }, {} as Record<string, number>);

  // Convert the grouped data into an array of CalendarHistoryType
  return Object.keys(dateMap).map(date => ({
    date,
    totalAmount: dateMap[date],
  }));
};
