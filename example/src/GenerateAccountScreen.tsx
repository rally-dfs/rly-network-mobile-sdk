import * as React from 'react';
import { Text, Button } from 'react-native';
import { AppContainer } from './components/AppContainer';

export const GenerateAccountScreen = (props: {
  generateAccount: () => void;
}) => {
  return (
    <AppContainer>
      <Text>No Account Exists, You need to generate one</Text>
      <Button title="Create RLY Account" onPress={props.generateAccount} />
    </AppContainer>
  );
};
