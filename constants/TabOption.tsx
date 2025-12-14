import {OptionsType} from '@/components/container/type';
import {AntDesign} from '@expo/vector-icons';

export const TabOptions: OptionsType[] = [
  {
    label: '',
    value: 'bar',
    icon: <AntDesign name="bar-chart" size={20} />,
  },
  {
    label: '',
    value: 'line',
    icon: <AntDesign name="line-chart" size={20} />,
  },
];

export const ReportTabOptions: OptionsType[] = [
  {
    label: 'Ngày',
    value: 'daily',
  },
  {
    label: 'Tuần',
    value: 'weekly',
  },
  {
    label: 'Tháng',
    value: 'monthly',
  },
  {
    label: 'Năm',
    value: 'yearly',
  },
];
