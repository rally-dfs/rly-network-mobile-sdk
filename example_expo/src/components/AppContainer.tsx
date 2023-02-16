import * as React from 'react';
import { StyleSheet, View } from 'react-native';

export const AppContainer = (props: { children: React.ReactNode }) => {
  return <View style={styles.container}>{props.children}</View>;
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 60,
    paddingHorizontal: 12,
    backgroundColor: '#121212',
    alignItems: 'center',
  },
});
