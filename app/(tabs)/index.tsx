import {StyleSheet} from 'react-native';
import React from 'react';
import HomeScreen from '@/screens/homepage/Home.screen';
import * as Linking from 'expo-linking';

const Homepage = () => {
  const url = Linking.useURL();

  if (url) {
    const {hostname, path, queryParams} = Linking.parse(url);

    console.log(
      `Linked to app with hostname: ${hostname}, path: ${path} and data: ${JSON.stringify(
        queryParams,
      )}`,
    );
  }
  return <HomeScreen />;
};

export default Homepage;

const styles = StyleSheet.create({});
