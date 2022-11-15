import * as React from 'react';
import { AppContainer } from './components/AppContainer';
import { BodyText, HeadingText } from './components/text';
import { Button, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';
import { RlyDummyNetwork } from 'rly-network-mobile-sdk';
import { RlyCard } from './components/RlyCard';
import { LoadingModal } from './components/LoadingModal';

const RlyNetwork = RlyDummyNetwork;

export const AccountOverviewScreen = (props: { rlyAccount: string }) => {
  const [performingAction, setPerformingAction] = useState<string>();

  const [balance, setBalance] = useState<number>();

  const [transferBalance, setTransferBalance] = useState('');
  const [transferAddress, setTranferAddress] = useState('');

  const fetchBalance = async () => {
    const bal = await RlyNetwork.getBalance();

    setBalance(bal);
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const registerAccount = async () => {
    setPerformingAction('Registering Account');
    await RlyNetwork.registerAccount();

    await fetchBalance();
    setPerformingAction(undefined);
  };

  const transferTokens = async () => {
    setPerformingAction('Transfering Tokens');
    await RlyNetwork.transfer(transferAddress, transferBalance);

    await fetchBalance();
    setPerformingAction(undefined);
    setTransferBalance('');
    setTranferAddress('');
  };

  return (
    <>
      <AppContainer>
        <ScrollView>
          <HeadingText>Welcome to RLY</HeadingText>
          <View style={styles.addressContainer}>
            <BodyText>{props.rlyAccount || 'No Account Exists'}</BodyText>
          </View>
          <RlyCard style={styles.balanceCard}>
            <View style={styles.balanceContainer}>
              <BodyText>Your Current Balance Is</BodyText>
              <BodyText>{balance}</BodyText>
            </View>
          </RlyCard>
          <View style={styles.balanceCard}>
            <BodyText>What Would You Like to Do?</BodyText>
          </View>

          <RlyCard style={styles.balanceCard}>
            <Button onPress={registerAccount} title="Register My Account" />
          </RlyCard>

          <RlyCard style={styles.balanceCard}>
            <View style={styles.alignMiddle}>
              <BodyText>Transfer RLY</BodyText>
            </View>
            <View>
              <BodyText>Recipient</BodyText>
              <TextInput
                style={styles.input}
                value={transferAddress}
                onChangeText={setTranferAddress}
              />
            </View>
            <View>
              <BodyText>Amount</BodyText>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={transferBalance}
                onChangeText={setTransferBalance}
              />
            </View>
            <Button onPress={transferTokens} title="Transfer" />
          </RlyCard>
        </ScrollView>
      </AppContainer>

      <LoadingModal
        title={performingAction || 'Loading'}
        show={!!performingAction}
      />
    </>
  );
};

export const styles = StyleSheet.create({
  alignMiddle: {
    alignItems: 'center',
  },
  balanceCard: {
    marginTop: 24,
  },
  balanceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressContainer: {
    marginTop: 16,
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
