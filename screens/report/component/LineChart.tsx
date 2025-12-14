import {COLOR_THEME} from '@/style/ColorTheme';
import React, {useState} from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import Svg, {
  Text as SvgText,
  G,
  Circle,
  Polyline,
  Rect,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import {ChartDataType, YAxisType} from '../type';

type LineChartProps = {
  data: ChartDataType[];
  yAxisValues: YAxisType[];
  labelType?: string;
};

const LineChart: React.FC<LineChartProps> = ({
  data,
  yAxisValues,
  labelType,
}) => {
  const containerPadding = 50;
  const svgWidth = Dimensions.get('window').width - containerPadding - 40;
  const chartHeight = 200;
  const xAxisHeight = 30;
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
    0,
  );

  const pointSpacing = data.length > 0 ? svgWidth / data.length : 0;
  const maxValue =
    Math.max(...yAxisValues.map(y => parseFloat(y.value || '0')), 1) * 1.4;

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Svg
      height={chartHeight + xAxisHeight}
      width={svgWidth + containerPadding}
      style={styles.svg}>
      <G>
        <Defs>
          <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop
              offset="0%"
              stopColor={COLOR_THEME.base.primary}
              stopOpacity="0.3"
            />
            <Stop
              offset="100%"
              stopColor={COLOR_THEME.base.primary}
              stopOpacity="0"
            />
          </LinearGradient>
        </Defs>
        <Polyline
          points={data
            .map(
              (item, index) =>
                `${containerPadding + index * pointSpacing},${
                  chartHeight - (item.value / maxValue) * chartHeight
                }`,
            )
            .join(' ')}
          fill="none"
          stroke={COLOR_THEME.base.primary}
          strokeWidth="2"
        />

        {data.map((item, index) => {
          const cx = containerPadding + index * pointSpacing;
          const cy = chartHeight - (item.value / maxValue) * chartHeight;

          return (
            <G key={index}>
              <Circle
                cx={cx}
                cy={cy}
                r="5"
                fill={
                  index === selectedPointIndex
                    ? COLOR_THEME.base.primary
                    : '#fff'
                }
                stroke={COLOR_THEME.base.primary}
                onPress={() => setSelectedPointIndex(index)}
              />
              {index === selectedPointIndex && (
                <G>
                  <Rect
                    x={cx - 15}
                    y={cy - 35}
                    width="30"
                    height="20"
                    fill="white"
                    stroke={COLOR_THEME.base.primary}
                    rx="5"
                  />
                  <SvgText
                    x={cx}
                    y={cy - 20}
                    fontSize="12"
                    fill={COLOR_THEME.base.primary}
                    textAnchor="middle">
                    {`${item.value || 0}${labelType || '%'}`}
                  </SvgText>
                </G>
              )}
              <SvgText
                x={cx}
                y={chartHeight + 20}
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
            y={chartHeight - (parseFloat(y.value || '0') / maxValue) * chartHeight}
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

export default LineChart;
