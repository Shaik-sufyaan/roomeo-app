import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MainApp } from './src/screens/MainApp';

export default function App() {
  return (
    <View style={styles.container}>
      <MainApp />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F1', // Roomio background color
  },
});
