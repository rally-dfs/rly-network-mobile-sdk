import type { Wallet } from 'ethers';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';
import { createAccount, getAccount } from 'rly-network-mobile-sdk';

export default function App() {
  const [accountLoaded, setAccountLoaded] = useState(false);
  const [rlyAccount, setRlyAccount] = useState<Wallet | undefined>();

  useEffect(() => {
    const readAccount = async () => {
      const account = await getAccount();

      setAccountLoaded(true);

      if (account) {
        setRlyAccount(account);
      }
    };

    if (!accountLoaded) {
      readAccount();
    }
  }, [accountLoaded]);

  const createRlyAccount = async () => {
    console.log('Going to generate account');

    const rlyAct = await createAccount();
    setRlyAccount(rlyAct);
  };

  if (!accountLoaded) {
    return <LoadingScreen />;
  }

  if (!rlyAccount) {
    return <GenerateAccountView generateAccount={createRlyAccount} />;
  }

  return <AccountView rlyAccount={rlyAccount} />;
}

const AppContainer = (props: { children: React.ReactNode }) => {
  return <View style={styles.container}>{props.children}</View>;
};

const GenerateAccountView = (props: { generateAccount: () => void }) => {
  return (
    <AppContainer>
      <Text>No Account Exists, You need to generate one</Text>
      <Button title="Create RLY Account" onPress={props.generateAccount} />
    </AppContainer>
  );
};

const AccountView = (props: { rlyAccount?: Wallet }) => {
  return (
    <AppContainer>
      <Text>
        RLY Account Key = {props.rlyAccount?.publicKey || 'No Account Exists'}
      </Text>
    </AppContainer>
  );
};

const LoadingScreen = () => {
  return (
    <AppContainer>
      <Text> Loading RLY Account </Text>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
