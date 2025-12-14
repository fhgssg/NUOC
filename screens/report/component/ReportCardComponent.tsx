import { StyleSheet, Text, View } from 'react-native';
import React, { useContext, useState } from 'react';
import BarChart from './BarChart';
import { FontContext } from '@/context/FontThemeContext';
import ButtonTabOptions from '@/components/container/ButtonTabOptions';
import { TabOptions } from '@/constants/TabOption';
import { ChartDataType, YAxisType } from '../type';
import LineChart from './LineChart';
import { ScreenDimension } from '@/constants/Dimensions';

type ReportCardComponentProps = {
  data: ChartDataType[];
  yAxis: YAxisType[];
  title: string;
  labelType?: string;
};
const ReportCardComponent = ({
  data,
  yAxis,
  title,
  labelType,
}: ReportCardComponentProps) => {
  const [selectedTab, setSelectedTab] = useState('bar');
  const { textTheme } = useContext(FontContext);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[
            textTheme.subText,
            { fontWeight: 'bold', color: '#333', fontSize: 18 },
          ]}>
          {title}
        </Text>
        <ButtonTabOptions
          options={TabOptions}
          handleOptionSelect={setSelectedTab}
          selectedOption={selectedTab}
          type="secondary"
        />
      </View>
      <View style={{ marginTop: 10 }}>
        {selectedTab === 'bar' ? (
          <BarChart labelType={labelType} data={data} yAxisValues={yAxis} />
        ) : (
          <LineChart labelType={labelType} data={data} yAxisValues={yAxis} />
        )}
      </View>
    </View>
  );
};

export default ReportCardComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: ScreenDimension.horizontalPadding,
    paddingVertical: ScreenDimension.scale(10),
    marginBottom: ScreenDimension.scale(10),
  },
  header: {
    paddingVertical: ScreenDimension.scale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#efefef',
    borderBottomWidth: 1,
    marginRight: -ScreenDimension.horizontalPadding,
    paddingRight: ScreenDimension.horizontalPadding,
    flexWrap: 'wrap',
  },
});
