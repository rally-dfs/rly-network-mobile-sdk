import * as React from 'react';
import { useState } from 'react';
import { Alert, View, Button, StyleSheet, TextInput } from 'react-native';
import { AppContainer } from './components/AppContainer';
import { RlyCard } from './components/RlyCard';
import { BodyText, HeadingText } from './components/text';

export const GenerateAccountScreen = (props: {
  generateAccount: () => void;
  generateSmartAccount: () => void;
  importExistingAccount: (arg0: string) => void;
}) => {
  const [existingMnemonic, setExistingMnemonic] = useState('');

  const importButtonPress = () => {
    if (!existingMnemonic) {
      Alert.alert('Mnemonic is empty');
      return;
    }
    props.importExistingAccount(existingMnemonic);
  };

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
        <Button
          title="Create RLY Smart Account"
          onPress={props.generateSmartAccount}
        />
      </RlyCard>
      <RlyCard style={styles.cardMargin}>
        <View style={styles.marginBetween}>
          <BodyText>...or import an existing mnemonic</BodyText>
        </View>
        <TextInput
          secureTextEntry={true}
          style={styles.input}
          value={existingMnemonic}
          onChangeText={setExistingMnemonic}
        />

        <Button title="Import Existing Account" onPress={importButtonPress} />
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
