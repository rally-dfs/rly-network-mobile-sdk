// IMPORTANT
// Import order here needs to be very explicit.
// In order for true source of random on react native we must import the rn library
// prior to the ether shims
import 'react-native-get-random-values';
import '@ethersproject/shims';

import { Wallet } from 'ethers';
import { getGenericPassword, setGenericPassword } from 'react-native-keychain';

export async function createAccount(overwrite?: boolean) {
  const existingWallet = await getAccount();

  if (existingWallet && !overwrite) {
    throw 'Account already exists';
  }

  const newWallet = Wallet.createRandom();

  const privateKey = newWallet.privateKey;

  setGenericPassword('', privateKey);

  return newWallet.address;
}

export async function getWallet() {
  const credentials = await getGenericPassword();
  if (!credentials) {
    return;
  }

  const privateKey = credentials.password;
  return new Wallet(privateKey);
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
