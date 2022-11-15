import * as React from 'react';
import { AppContainer } from './components/AppContainer';
import { BodyText, HeadingText } from './components/text';
import {
  ActivityIndicator,
  Button,
  Modal,
  StyleSheet,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import { RlyDummyNetwork } from 'rly-network-mobile-sdk';
import { RlyCard } from './components/RlyCard';

const RlyNetwork = RlyDummyNetwork;

export const AccountOverviewScreen = (props: { rlyAccount: string }) => {
  const [loading, setLoading] = useState(false);

  const [balance, setBalance] = useState<number>();

  const fetchBalance = async () => {
    const bal = await RlyNetwork.getBalance();

    setBalance(bal);
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const registerAccount = async () => {
    setLoading(true);
    await RlyNetwork.registerAccount();

    await fetchBalance();
    setLoading(false);
  };

  return (
    <>
      <AppContainer>
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
      </AppContainer>

      <Modal visible={loading} transparent>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <HeadingText>Loading...</HeadingText>
            <ActivityIndicator />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: '#212121',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
