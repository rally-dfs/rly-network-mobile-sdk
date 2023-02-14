import { Wallet } from 'ethers';
import { NativeCodeWrapper } from '../src/native_code_wrapper';

let _cachedWallet: Wallet | undefined;

export async function createAccount(overwrite?: boolean) {
  const existingWallet = await getWallet();

  if (existingWallet && !overwrite) {
    throw 'Account already exists';
  }

  const mnemonic = await NativeCodeWrapper.generateMnemonic();
  const pkey = await NativeCodeWrapper.getPrivateKeyFromMnemonic(mnemonic);
  const newWallet = new Wallet(pkey);

  _cachedWallet = newWallet;

  return newWallet.address;
}

export async function getWallet() {
  if (_cachedWallet) {
    return _cachedWallet;
  }

  let mnemonic = await NativeCodeWrapper.getMnemonic();

  if (!mnemonic) {
    mnemonic = await NativeCodeWrapper.generateMnemonic();
    await NativeCodeWrapper.saveMnemonic(mnemonic);
  }

  console.log(mnemonic);

  const pkey = await NativeCodeWrapper.getPrivateKeyFromMnemonic(mnemonic);
  const wallet = new Wallet(pkey);

  _cachedWallet = wallet;
  return wallet;
}

export async function getAccount() {
  const wallet = await getWallet();

  return wallet?.address;
}

export async function getAccountPhrase() {
  try {
    return await NativeCodeWrapper.getMnemonic();
  } catch (error) {
    return;
  }
}
