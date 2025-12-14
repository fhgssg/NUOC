import {ScrollView, StyleSheet, View} from 'react-native';
import React from 'react';
import Header from './Header';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

type ScreenContainerProps = {
  children: React.ReactNode;
  headerTitle: string;
  showBackButton?: boolean;
};
const ScreenContainer = ({children, headerTitle, showBackButton = false}: ScreenContainerProps) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{flex: 1, backgroundColor: '#F5F5F5'}}>
      <Header 
        title={headerTitle}
        containerStyling={{
          paddingTop: Math.max(insets.top, 6),
        }}
        showBackButton={showBackButton}
      />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#F5F5F5',
        }}
        edges={['bottom']}>
        <View style={{flex: 1, width: '100%', backgroundColor: '#F5F5F5'}}>
          <ScrollView
            style={[styles.scrollView, {backgroundColor: '#F5F5F5'}]}
            contentContainerStyle={{
              paddingBottom: 0,
              width: '100%',
            }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default ScreenContainer;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
