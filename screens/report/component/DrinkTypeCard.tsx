import {StyleSheet, Text, View} from 'react-native';
import React, {useContext} from 'react';
import DonutChart from './DonutChart';
import {DonutChartType} from '../type';
import {FontContext} from '@/context/FontThemeContext';

type DrinkTypeCardProps = {
  data: DonutChartType[];
  title: string;
};
const DrinkTypeCard = ({data, title}: DrinkTypeCardProps) => {
  const {textTheme} = useContext(FontContext);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[
            textTheme.subText,
            {fontWeight: 'bold', color: '#333', fontSize: 18},
          ]}>
          {title}
        </Text>
      </View>
      <View style={{marginTop: 10}}>
        <DonutChart data={data} />
      </View>
    </View>
  );
};

export default DrinkTypeCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#efefef',
    borderBottomWidth: 1,
  },
});
