import * as React from 'react';
import { AppContainer } from './components/AppContainer';
import { BodyText, HeadingText } from './components/text';
import {
  Button,
  Linking,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import { getAccountPhrase, RlyLocalNetwork } from 'rly-network-mobile-sdk';
import { RlyCard } from './components/RlyCard';
import { LoadingModal, StandardModal } from './components/LoadingModal';

const RlyNetwork = RlyLocalNetwork;

export const AccountOverviewScreen = (props: { rlyAccount: string }) => {
  const [performingAction, setPerformingAction] = useState<string>();

  const [balance, setBalance] = useState<number>();

  const [transferBalance, setTransferBalance] = useState('');
  const [transferAddress, setTranferAddress] = useState('');

  const [mnemonic, setMnemonic] = useState<string>();

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
    await RlyNetwork.transfer(transferAddress, parseInt(transferBalance, 10));

    await fetchBalance();
    setPerformingAction(undefined);
    setTransferBalance('');
    setTranferAddress('');
  };

  const revealMnemonic = async () => {
    const value = await getAccountPhrase();

    if (!value) {
      throw 'Something went wrong, no Mnemonic when there should be one';
    }

    setMnemonic(value);
  };

  return (
    <>
      <AppContainer>
        <ScrollView>
          <View style={styles.alignMiddle}>
            <HeadingText>Welcome to RLY</HeadingText>
          </View>
          <View style={styles.addressContainer}>
            <BodyText>{props.rlyAccount || 'No Account Exists'}</BodyText>
          </View>
          <RlyCard style={styles.balanceCard}>
            <View style={styles.balanceContainer}>
              <BodyText>Your Current Balance Is</BodyText>
              <HeadingText>{balance}</HeadingText>
            </View>
            <View style={styles.balanceContainer}>
              <Button
                title="View on Polygon"
                onPress={() => {
                  Linking.openURL(
                    `https://mumbai.polygonscan.com/address/${props.rlyAccount}`
                  );
                }}
              />
            </View>
          </RlyCard>
          <View
            style={Object.assign({}, styles.balanceCard, styles.alignMiddle)}
          >
            <BodyText>What Would You Like to Do?</BodyText>
          </View>

          <RlyCard style={styles.balanceCard}>
            <View style={styles.alignMiddle}>
              <BodyText>Register My Account</BodyText>
            </View>
            <Button onPress={registerAccount} title="Register" />
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

          <RlyCard style={styles.balanceCard}>
            <View style={styles.alignMiddle}>
              <BodyText>Export Your Account</BodyText>
            </View>
            <Button title="Reveal my Mnemonic" onPress={revealMnemonic} />
          </RlyCard>
        </ScrollView>
      </AppContainer>

      <StandardModal show={!!mnemonic}>
        <View>
          <View>
            <BodyText>Copy The Phrase below to export your wallet</BodyText>
          </View>
          <View style={styles.balanceCard}>
            <HeadingText>{mnemonic}</HeadingText>
          </View>
          <View style={styles.balanceCard}>
            <Button
              title="Close"
              onPress={() => {
                setMnemonic(undefined);
              }}
            />
          </View>
        </View>
      </StandardModal>

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
