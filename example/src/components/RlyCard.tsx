import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export function RlyCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style: StyleProp<ViewStyle>;
}) {
  return (
    <View style={Object.assign({}, styles.cardStyle, style)}>{children}</View>
  );
}

export const styles = StyleSheet.create({
  cardStyle: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#212121',
    borderWidth: 1,
    borderColor: '#595959',
    minWidth: '90%',
  },
});
