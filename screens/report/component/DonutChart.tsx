import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Circle, G, Text as SvgText} from 'react-native-svg';

// Data types for the chart
type ChartData = {
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  data: ChartData[];
  radius?: number;
  strokeWidth?: number;
};

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  radius = 70,
  strokeWidth = 20,
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  const total = data.reduce((acc, item) => acc + (item.value || 0), 0); // Total for calculating percentage
  const center = radius + strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const chartWidth = center * 2;
  const [selectedChart, setSelectedChart] = useState<ChartData>(data[0] || {label: '', value: 0, color: '#000'});

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartWidth}>
        <G
          key={selectedChart?.value}
          rotation="-90"
          origin={`${center}, ${center}`}>
          {data.map((item, index) => {
            const segmentValue = (item.value / total) * circumference;
            const offset = data
              .slice(0, index)
              .reduce(
                (acc, item) => acc + (item.value / total) * circumference,
                0,
              );

            return (
              <Circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segmentValue} ${circumference}`}
                strokeDashoffset={-offset}
                fill="none"
                opacity={selectedChart?.value === item.value ? 0.5 : 1}
                origin={`${center}, ${center}`}
                onPress={() => setSelectedChart(item)}
              />
            );
          })}
        </G>

        {/* Center Text */}
        <SvgText
          x={center}
          y={center}
          textAnchor="middle"
          fontSize="20"
          fontWeight="bold"
          fill="#333">
          {String(selectedChart?.value || 0)}%
        </SvgText>
        <SvgText
          x={center}
          y={center + 20}
          textAnchor="middle"
          fontSize="14"
          fill="#333">
          {String(selectedChart?.label || '')}
        </SvgText>
      </Svg>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.colorBox, {backgroundColor: item.color}]} />
            <Text style={styles.legendText}>
              {`${item.label || ''} (${item.value || 0}%)`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendContainer: {
    marginLeft: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  colorBox: {
    width: 12,
    height: 12,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
});

export default DonutChart;
