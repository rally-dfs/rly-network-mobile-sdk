// IMPORTANT
// Import order here needs to be very explicit.
// In order for true source of random on react native we must import the rn library
// prior to the ether shims
import 'react-native-get-random-values';
import '@ethersproject/shims';

import { Wallet } from 'ethers';
import { getGenericPassword, setGenericPassword } from 'react-native-keychain';
import { NativeCodeWrapper } from '../src/native_code_wrapper';


let _cachedWallet: Wallet | undefined;

export async function createAccount(overwrite?: boolean) {
  const existingWallet = await getWallet();

  if (existingWallet && !overwrite) {
    throw 'Account already exists';
  }

  const newWallet = Wallet.createRandom();

  await setGenericPassword('rly-sdk-private-key', newWallet.mnemonic.phrase, {
    service: 'rly-mnemonic',
  });
  _cachedWallet = newWallet;

  return newWallet.address;
}

export async function getWallet() {
  if (_cachedWallet) {
    return _cachedWallet;
  }
  var t0 = performance.now()


  const mnemonic = await NativeCodeWrapper.getMnemonic()

  const wallet = new Wallet(mnemonic);
  var t1 = performance.now()
  console.log(`wallet generation for account (${wallet.address}) from c took ${(t1 - t0)} milliseconds.`)
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
