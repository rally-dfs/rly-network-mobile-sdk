// IMPORTANT
// Import order here needs to be very explicit.
// In order for true source of random on react native we must import the rn library
// prior to the ether shims
import 'react-native-get-random-values';
import '@ethersproject/shims';

import { Wallet } from 'ethers';
import { getGenericPassword, setGenericPassword } from 'react-native-keychain';

export async function createAccount(overwrite?: boolean) {
  console.log('Checking for existing account');
  const existingWallet = await getWallet();

  if (existingWallet && !overwrite) {
    throw 'Account already exists';
  }

  console.log('Preparing to Generate Wallet');
  const newWallet = Wallet.createRandom();

  const privateKey = newWallet.privateKey;
  console.log('Wallet Generated');

  console.log('Storing in secure device storage');
  await setGenericPassword('', privateKey, { service: 'rly-pkey' });
  await setGenericPassword('', newWallet.mnemonic.phrase, {
    service: 'rly-mnemonic',
  });
  console.log('Storage complete');

  return newWallet.address;
}

export async function getWallet() {
  console.log('reading key from secure device storage');
  const credentials = await getGenericPassword({ service: 'rly-pkey' });

  if (!credentials) {
    return;
  }

  console.log('Key found');

  const privateKey = credentials.password;
  return new Wallet(privateKey);
}

export async function getAccount() {
  const wallet = await getWallet();

  return wallet?.address;
}

export async function getAccountPhrase() {
  const credentials = await getGenericPassword({ service: 'rly-mnemonic' });
  const mnemonic = credentials && credentials.password;

  if (!mnemonic) {
    return;
  }

  return mnemonic;
}
