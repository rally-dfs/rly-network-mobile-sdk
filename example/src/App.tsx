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

  return (
    <View style={styles.container}>
      {accountLoaded ? (
        <AccountView
          rlyAccount={rlyAccount}
          generateAccount={() => {
            createRlyAccount();
          }}
        />
      ) : (
        <LoadingScreen />
      )}
    </View>
  );
}

const AccountView = (props: {
  rlyAccount?: Wallet;
  generateAccount: () => void;
}) => {
  if (!props.rlyAccount?.publicKey) {
    return (
      <>
        <Text>No Account Exists, You need to generate one</Text>
        <Button title="Create RLY Account" onPress={props.generateAccount} />
      </>
    );
  }
  return (
    <Text>
      RLY Account Key = {props.rlyAccount?.publicKey || 'No Account Exists'}
    </Text>
  );
};

const LoadingScreen = () => {
  return <Text> Loading RLY Account </Text>;
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
