import * as React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { AppContainer } from './components/AppContainer';
import { RlyCard } from './components/RlyCard';
import { BodyText, HeadingText } from './components/text';

export const GenerateAccountScreen = (props: {
  generateSmartAccount: () => Promise<void>;
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
        <Button
          title="Create Smart Account"
          onPress={props.generateSmartAccount}
        />
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
  input: {
    height: 40,
    padding: 10,
    marginVertical: 12,
    color: 'white',
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    borderWidth: 0,
  },
});
