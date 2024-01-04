import * as React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { BodyText, HeadingText } from './components/text';

export const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <HeadingText> Loading RLY Account </HeadingText>
      <View style={styles.smallMargin}>
        <BodyText>This may take several seconds</BodyText>
      </View>
      <ActivityIndicator style={styles.standardMargin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    paddingHorizontal: 12,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  smallMargin: {
    marginTop: 12,
  },
  standardMargin: {
    marginTop: 24,
  },
});
