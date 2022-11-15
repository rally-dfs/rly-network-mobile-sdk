import * as React from 'react';
import { Text } from 'react-native';
import { AppContainer } from './components/AppContainer';

export const AccountOverviewScreen = (props: { rlyAccount?: string }) => {
  return (
    <AppContainer>
      <Text>RLY Account Key = {props.rlyAccount || 'No Account Exists'}</Text>
    </AppContainer>
  );
};
