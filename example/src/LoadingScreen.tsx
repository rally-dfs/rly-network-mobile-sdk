import * as React from 'react';
import { AppContainer } from './components/AppContainer';
import { BodyText } from './components/text';

export const LoadingScreen = () => {
  return (
    <AppContainer>
      <BodyText> Loading RLY Account </BodyText>
    </AppContainer>
  );
};
