import { IntakeHistoryType } from '@/storage/userinfo/type';
import { ChartDataType, ReportFilterType, YAxisType } from './type';
import { startOfWeek, format, parseISO, isSameWeek, isSameDay, isSameMonth, subDays, subWeeks, subMonths, eachDayOfInterval, isLeapYear } from 'date-fns';

export const DrinkCompletionYAxis: YAxisType[] = [
  {
    label: '0%',
    value: '0',
  },
  {
    label: '20%',
    value: '20',
  },
  {
    label: '40%',
    value: '40',
  },
  {
    label: '60%',
    value: '60',
  },
  {
    label: '80%',
    value: '80',
  },
  {
    label: '100%',
    value: '100',
  },
];

const colorMap: Record<string, string> = {
  water: '#4A90E2', // Blue for water
  Water: '#4A90E2', // Blue for water
  Nước: '#4A90E2', // Blue for water (Vietnamese)
  Juice: '#F5A623', // Orange for juice
  'Nước ép': '#F5A623', // Orange for juice (Vietnamese)
  Coffee: '#8B572A', // Brown for coffee
  'Cà phê': '#8B572A', // Brown for coffee (Vietnamese)
  Tea: '#D0021B', // Red for tea
  Trà: '#D0021B', // Red for tea (Vietnamese)
  Beer: '#F8E71C', // Yellow for beer
  Bia: '#F8E71C', // Yellow for beer (Vietnamese)
  Soda: '#D0021B', // Red for soda
  Wine: '#BD10E0', // Purple for wine
  'Rượu vang': '#BD10E0', // Purple for wine (Vietnamese)
  Carbon: '#FF6347', // Tomato red for carbonated drinks
  'Nước có ga': '#FF6347', // Tomato red for carbonated drinks (Vietnamese)
  'Coconut Drink': '#FFE4B5', // Light beige for coconut drink
  'Nước dừa': '#FFE4B5', // Light beige for coconut drink (Vietnamese)
  'Sports Drink': '#32CD32', // Lime green for sports drinks
  'Nước thể thao': '#32CD32', // Lime green for sports drinks (Vietnamese)
  Smoothie: '#FF69B4', // Pink for smoothies
  'Sinh tố': '#FF69B4', // Pink for smoothies (Vietnamese)
  Chocolate: '#D2691E', // Chocolate brown
  'Sô cô la': '#D2691E', // Chocolate brown (Vietnamese)
  Liquor: '#8A2BE2', // Blue-violet for liquor
  'Rượu mạnh': '#8A2BE2', // Blue-violet for liquor (Vietnamese)
};

export const transformToDonutChartData = (
  intakeHistory: IntakeHistoryType[],
) => {
  if (!intakeHistory || intakeHistory.length === 0) {
    return [];
  }

  // Count occurrences of each drinkType
  const drinkCountMap = intakeHistory.reduce((acc: any, item) => {
    const { drinkType } = item;
    if (drinkType) {
      acc[drinkType] = (acc[drinkType] || 0) + 1;
    }
    return acc;
  }, {});

  // Total count of all drinks
  const totalCount = intakeHistory.length;

  // Transform to DonutChartType
  return Object.keys(drinkCountMap).map(drinkType => ({
    label: drinkType,
    value: Math.round((drinkCountMap[drinkType] / totalCount) * 100),
    color: colorMap[drinkType] || '#000000', // Fallback color if not in colorMap
  }));
};

export function getChartData(
  selectedFilter: ReportFilterType,
  userWaterIntakeHistory: IntakeHistoryType[],
): ChartDataType[] {
  if (!userWaterIntakeHistory) {
    return [];
  }
  const today = new Date();

  // Ngày: 6 ngày gần nhất + hôm nay = 7 ngày
  if (selectedFilter === 'daily') {
    const sixDaysAgo = subDays(today, 6);
    const days = eachDayOfInterval({ start: sixDaysAgo, end: today });

    const dailyData: ChartDataType[] = days.map(day => ({
      label: format(day, 'dd/MM'),
      value: 0,
    }));

    // Calculate total intake for each day
    userWaterIntakeHistory.forEach(entry => {
      if (!entry.date) return;
      const entryDate = parseISO(entry.date);
      const dayIndex = days.findIndex(day => isSameDay(day, entryDate));
      if (dayIndex >= 0 && entry.amount) {
        const amount = parseInt(entry.amount, 10);
        if (!isNaN(amount)) {
          dailyData[dayIndex].value += amount;
        }
      }
    });

    return dailyData;
  }

  // Tuần: 4 tuần gần nhất
  if (selectedFilter === 'weekly') {
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weeks: Date[] = [];

    // Tạo 4 tuần: tuần hiện tại + 3 tuần trước
    for (let i = 0; i < 4; i++) {
      weeks.push(subWeeks(currentWeekStart, 3 - i));
    }

    const weeklyData: ChartDataType[] = weeks.map((week, index) => {
      const isCurrentWeek = index === 3; // Tuần cuối là tuần hiện tại
      return {
        label: isCurrentWeek
          ? 'Tuần này'
          : format(week, 'dd/MM'),
        value: 0,
      };
    });

    // Calculate total intake for each week
    userWaterIntakeHistory.forEach(entry => {
      if (!entry.date) return;
      const entryDate = parseISO(entry.date);
      const weekIndex = weeks.findIndex(week =>
        isSameWeek(entryDate, week, { weekStartsOn: 1 })
      );
      if (weekIndex >= 0 && entry.amount) {
        const amount = parseInt(entry.amount, 10);
        if (!isNaN(amount)) {
          weeklyData[weekIndex].value += amount;
        }
      }
    });

    return weeklyData;
  }

  // Tháng: 3 tháng gần nhất
  if (selectedFilter === 'monthly') {
    const months: Date[] = [];
    for (let i = 0; i < 3; i++) {
      months.push(subMonths(today, 2 - i));
    }

    const monthlyData: ChartDataType[] = months.map((month, index) => {
      const isCurrentMonth = index === 2; // Tháng cuối là tháng hiện tại
      return {
        label: isCurrentMonth
          ? 'Tháng này'
          : format(month, 'MM/yyyy'),
        value: 0,
      };
    });

    // Calculate total intake for each month
    userWaterIntakeHistory.forEach(entry => {
      if (!entry.date) return;
      const entryDate = parseISO(entry.date);
      const monthIndex = months.findIndex(month =>
        isSameMonth(entryDate, month)
      );
      if (monthIndex >= 0 && entry.amount) {
        const amount = parseInt(entry.amount, 10);
        if (!isNaN(amount)) {
          monthlyData[monthIndex].value += amount;
        }
      }
    });

    return monthlyData;
  }

  if (selectedFilter === 'yearly') {
    // Initialize data for the current year and the past 5 years
    const yearlyData: ChartDataType[] = Array.from({ length: 6 }, (_, i) => {
      const year = today.getFullYear() - i;
      return { label: year.toString(), value: 0 };
    });

    // Calculate total intake for each year
    userWaterIntakeHistory.forEach(entry => {
      if (!entry.date) return;
      const entryDate = parseISO(entry.date);
      const entryYear = entryDate.getFullYear();
      const yearIndex = today.getFullYear() - entryYear;
      if (yearIndex >= 0 && yearIndex < 6 && entry.amount) {
        const amount = parseInt(entry.amount, 10);
        if (!isNaN(amount)) {
          yearlyData[yearIndex].value += amount;
        }
      }
    });

    return yearlyData.reverse(); // Reverse to show oldest year first
  }

  return [];
}

export function calculateIntakePercentage(
  chartData: ChartDataType[],
  intakeShouldPerDay: number,
  selectedFilter: ReportFilterType,
): ChartDataType[] {
  // Get the total intake requirement based on the selected filter
  let totalIntakeRequirement = 0;

  switch (selectedFilter) {
    case 'daily':
      totalIntakeRequirement = intakeShouldPerDay;
      break;
    case 'weekly':
      // Mỗi tuần = 7 ngày
      totalIntakeRequirement = intakeShouldPerDay * 7;
      break;
    case 'monthly':
      // Tính số ngày trong mỗi tháng (lấy trung bình hoặc tháng hiện tại)
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      totalIntakeRequirement = intakeShouldPerDay * daysInMonth;
      break;
    case 'yearly':
      const daysInYear = isLeapYear(new Date()) ? 366 : 365;
      totalIntakeRequirement = intakeShouldPerDay * daysInYear;
      break;
  }

  // Calculate percentage for each data point
  return chartData.map(dataPoint => {
    const percentage = totalIntakeRequirement > 0
      ? Math.round((dataPoint.value / totalIntakeRequirement) * 100)
      : 0;
    return {
      ...dataPoint,
      value: Math.min(percentage, 100), // Cap at 100%
    };
  });
}


export function generateYAxisValues(
  minValue: number,
  maxValue: number,
  axisValue: number,
) {
  const yAxisValues = [];
  if (axisValue <= 1 || maxValue <= minValue) {
    // Return default values if invalid input
    return [
      { label: '0L', value: '0' },
      { label: `${(maxValue / 1000).toFixed(0)}L`, value: `${(maxValue / 1000).toFixed(0)}` },
    ];
  }
  const step = (maxValue - minValue) / (axisValue - 1);

  for (let i = 0; i < axisValue; i++) {
    const value = minValue + step * i;
    yAxisValues.push({
      label: `${(value / 1000).toFixed(0)}L`, // Customize the label format if needed
      value: `${(value / 1000).toFixed(0)}`,
    });
  }

  return yAxisValues;
}
