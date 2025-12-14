import {COLOR_THEME} from '@/style/ColorTheme';
import React, {useState} from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import Svg, {Rect, Text as SvgText, G} from 'react-native-svg';
import {ChartDataType, YAxisType} from '../type';

type BarChartProps = {
  data: ChartDataType[];
  yAxisValues: YAxisType[];
  labelType?: string;
};

const BarChart: React.FC<BarChartProps> = ({data, yAxisValues, labelType}) => {
  const containerPadding = 40;
  const svgWidth = Dimensions.get('window').width - containerPadding - 50;
  const barWidth = data.length > 0 ? svgWidth / data.length - 10 : 0;
  const barSpacing = 10;
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(
    data.length > 0 ? data.length - 1 : null,
  );

  const chartHeight = 150;
  const chartHeightWithPadding = chartHeight * 1.2;

  const maxValue =
    Math.max(...yAxisValues.map(y => parseFloat(y.value || '0')), 1) * 1.1;

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Svg
      height={chartHeightWithPadding + 50}
      width={svgWidth + containerPadding}
      style={styles.svg}>
      <G>
        {data.map((item, index) => {
          const barHeight =
            item.value > 0 ? (item.value / maxValue) * chartHeight : 0;
          const barY = chartHeightWithPadding - barHeight;

          return (
            <G key={index}>
              <Rect
                x={containerPadding + index * (barWidth + barSpacing)}
                y={barY}
                width={barWidth}
                height={barHeight}
                onPress={() => setSelectedBarIndex(index)}
                fill={
                  index === selectedBarIndex
                    ? COLOR_THEME.base.primary
                    : '#EEF7FF'
                }
                rx="5"
              />
              {index === selectedBarIndex && item.value > 0 && (
                <SvgText
                  x={
                    containerPadding +
                    index * (barWidth + barSpacing) +
                    barWidth / 2
                  }
                  y={barY - 10}
                  fontSize="12"
                  fill={COLOR_THEME.base.primary}
                  textAnchor="middle">
                  {`${item.value || 0}${labelType || '%'}`}
                </SvgText>
              )}
              <SvgText
                x={
                  containerPadding +
                  index * (barWidth + barSpacing) +
                  barWidth / 2
                }
                y={chartHeightWithPadding + 20}
                fontSize="12"
                fill="#888"
                textAnchor="middle">
                {item.label || ''}
              </SvgText>
            </G>
          );
        })}
        {yAxisValues.map((y, i) => (
          <SvgText
            key={i}
            x="20"
            y={
              chartHeightWithPadding -
              (parseFloat(y.value || '0') / maxValue) * chartHeight
            }
            fontSize="12"
            fill="#888"
            textAnchor="middle">
            {y.label || ''}
          </SvgText>
        ))}
      </G>
    </Svg>
  );
};

const styles = StyleSheet.create({
  svg: {
    marginTop: 10,
  },
});

export default BarChart;
