export type YAxisType = {
  label: string;
  value: string; // Custom Y-axis values with label and value
};

export type ChartDataType = {
  label: string;
  value: number;
};

export type DonutChartType = {
  label: string;
  value: number;
  color: string;
};

export type ReportFilterType = 'daily' | 'weekly' | 'monthly' | 'yearly';
