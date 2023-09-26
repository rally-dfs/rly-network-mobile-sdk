import React from 'react';
import { StyleSheet, Text } from 'react-native';

export function BodyText({ children }: { children: React.ReactNode }) {
  return <Text style={styles.standardText}>{children}</Text>;
}

export function HeadingText({ children }: { children: React.ReactNode }) {
  return <Text style={styles.headingText}>{children}</Text>;
}

export function SelectableText({ children }: { children: React.ReactNode }) {
  return (
    <Text selectable={true} style={styles.standardText}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  standardText: {
    color: '#FFFFFF',
  },
  headingText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 24,
  },
});
