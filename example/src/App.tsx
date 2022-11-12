import type { Wallet } from 'ethers';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { getAccount } from 'rly-network-mobile-sdk';

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
    readAccount();
  });

  return (
    <View style={styles.container}>
      {accountLoaded ? (
        <Text>
          RLY Account Key = {rlyAccount?.publicKey || 'No Account Exists'}
        </Text>
      ) : (
        <Text> Loading RLY Account </Text>
      )}
    </View>
  );
}

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
