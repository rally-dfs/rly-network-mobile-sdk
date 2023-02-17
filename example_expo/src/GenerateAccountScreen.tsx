import * as React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { AppContainer } from './components/AppContainer';
import { RlyCard } from './components/RlyCard';
import { BodyText, HeadingText } from './components/text';

export const GenerateAccountScreen = (props: {
  generateAccount: () => void;
}) => {
  return (
    <AppContainer>
      <View>
        <HeadingText>Welcome To The RLY Demo App</HeadingText>
      </View>
      <RlyCard style={styles.cardMargin}>
        <View style={styles.marginBetween}>
          <BodyText>Looks like you don't yet have an account</BodyText>
        </View>
        <Button title="Create RLY Account" onPress={props.generateAccount} />
      </RlyCard>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  marginBetween: {
    marginTop: 12,
  },
  cardMargin: {
    marginTop: 24,
  },
});
