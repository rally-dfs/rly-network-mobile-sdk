// IMPORTANT
// Import order here needs to be very explicit.
// In order for true source of random on react native we must import the rn library
// prior to the ether shims
import 'react-native-get-random-values';
import '@ethersproject/shims';

import { Wallet } from 'ethers';
import { getGenericPassword, setGenericPassword } from 'react-native-keychain';

let _cachedWallet: Wallet | undefined;

export async function createAccount(overwrite?: boolean) {
  const existingWallet = await getWallet();

  if (existingWallet && !overwrite) {
    throw 'Account already exists';
  }

  const newWallet = Wallet.createRandom();

  await setGenericPassword('', newWallet.mnemonic.phrase, {
    service: 'rly-mnemonic',
  });
  _cachedWallet = newWallet;

  return newWallet.address;
}

export async function getWallet() {
  if (_cachedWallet) {
    return _cachedWallet;
  }
  const credentials = await getGenericPassword({ service: 'rly-mnemonic' });

  if (!credentials) {
    return;
  }

  const mnemonic = credentials.password;
  const wallet = Wallet.fromMnemonic(mnemonic);
  _cachedWallet = wallet;
  return wallet;
}

export async function getAccount() {
  const wallet = await getWallet();

  return wallet?.address;
}

export async function getAccountPhrase() {
  const wallet = await getWallet();

  if (!wallet) {
    return;
  }

  return wallet.mnemonic.phrase;
}
