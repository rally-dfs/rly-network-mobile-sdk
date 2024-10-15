import * as React from 'react';
import { AppContainer } from './components/AppContainer';
import { BodyText, HeadingText, SelectableText } from './components/text';
import {
  Alert,
  Button,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import {
  getAccountPhrase,
  RlyBaseSepoliaNetwork,
  RlyAmoyNetwork,
  permanentlyDeleteAccount,
  walletBackedUpToCloud,
  updateWalletStorage,
  TokenConfig,
} from '@rly-network/mobile-sdk';
import { RlyCard } from './components/RlyCard';
import { LoadingModal, StandardModal } from './components/LoadingModal';
import { PrivateConfig } from './private_config';

const RlyNetwork = RlyAmoyNetwork;

RlyNetwork.setApiKey(PrivateConfig.RALLY_API_KEY || '');

// If you want to test using a custom token, you need to build the object by hand.
// You can find a list of pre-built supported tokens in supported_tokens.
// If no value is provided, the default token is RLY
const customToken: TokenConfig | undefined = undefined;

export const AccountOverviewScreen = (props: { rlyAccount: string }) => {
  const [performingAction, setPerformingAction] = useState<string>();

  const [balance, setBalance] = useState<number>();
  const [usingCloudBackup, setUsingCloudBackup] = useState<boolean>();

  const [transferBalance, setTransferBalance] = useState('');
  const [transferAddress, setTranferAddress] = useState('');

  const [mnemonic, setMnemonic] = useState<string>();

  const fetchBalance = async () => {
    const bal = await RlyNetwork.getDisplayBalance(customToken?.address);

    setBalance(bal);
  };

  const fetchCloudStatus = async () => {
    const isBackedUp = await walletBackedUpToCloud();

    setUsingCloudBackup(isBackedUp);
  };

  useEffect(() => {
    fetchBalance();
    fetchCloudStatus();
  }, []);

  const swapStorageLocation = async () => {
    if (usingCloudBackup === undefined) {
      console.log('Unable to swap location, wallet not initialized');
      return;
    }

    const changeToCloud = !usingCloudBackup;

    const storage = {
      saveToCloud: changeToCloud,
      rejectOnCloudSaveFailure: changeToCloud,
    };
    await updateWalletStorage(storage);

    await fetchCloudStatus();
  };

  const claimRlyTokens = async () => {
    setPerformingAction('Registering Account');
    try {
      await RlyNetwork.claimRly();
      await fetchBalance();
    } catch (e: any) {
      Alert.alert('Unable to claim RLY: ', e.message);
    } finally {
      setPerformingAction(undefined);
    }
  };

  const transferTokens = async () => {
    setPerformingAction('Transfering Tokens');
    try {
      await RlyNetwork.transfer(
        transferAddress,
        parseInt(transferBalance, 10),
        customToken?.address,
        customToken?.metaTxnMethod,
        customToken
      );
      await fetchBalance();
      setTransferBalance('');
      setTranferAddress('');
    } catch (e: any) {
      console.log('Something went wrong', e.message);
      Alert.alert('Something went wrong', e.message);
    } finally {
      setPerformingAction(undefined);
    }
  };

  const deleteAccount = async () => {
    await permanentlyDeleteAccount();
  };

  const revealMnemonic = async () => {
    const value = await getAccountPhrase();

    if (!value) {
      throw 'Something went wrong, no Mnemonic when there should be one';
    }

    setMnemonic(value);
  };

  const viewOnBlockExplorer = async () => {
    let explorerUrl = `https://www.oklink.com/amoy/address/${props.rlyAccount}`;

    if (RlyNetwork === RlyBaseSepoliaNetwork) {
      explorerUrl = `https://sepolia.basescan.org/address/${props.rlyAccount}`;
    }
    Linking.openURL(explorerUrl);
  };

  return (
    <>
      <AppContainer>
        <ScrollView>
          <View style={styles.alignMiddle}>
            <HeadingText>Welcome to RLY</HeadingText>
          </View>
          <View style={styles.addressContainer}>
            <SelectableText>
              {props.rlyAccount || 'No Account Exists'}
            </SelectableText>
            <Text style={{ color: 'white' }}>
              Backed up: {usingCloudBackup ? 'yes' : 'no'}
            </Text>
          </View>
          <RlyCard style={styles.balanceCard}>
            <View style={styles.balanceContainer}>
              <BodyText>Your Current Balance Is</BodyText>
              <HeadingText>{balance}</HeadingText>
            </View>
            <View style={styles.balanceContainer}>
              <Button
                title="View on Explorer"
                onPress={() => {
                  viewOnBlockExplorer();
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
            <Button onPress={claimRlyTokens} title="Claim RLY" />
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

          <RlyCard style={styles.balanceCard}>
            <View style={styles.alignMiddle}>
              <BodyText>Change wallet storage</BodyText>
            </View>
            <Button
              title="Swap Storage Location"
              onPress={swapStorageLocation}
            />
          </RlyCard>

          <RlyCard style={styles.balanceCard}>
            <View style={styles.alignMiddle}>
              <BodyText>Delete Your Account</BodyText>
            </View>
            <Button
              title="Delete my on device account"
              onPress={deleteAccount}
            />
          </RlyCard>
        </ScrollView>
      </AppContainer>

      <StandardModal show={!!mnemonic}>
        <View>
          <View>
            <BodyText>Copy The Phrase below to export your wallet</BodyText>
          </View>
          <View style={styles.balanceCard}>
            <SelectableText>{mnemonic}</SelectableText>
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
