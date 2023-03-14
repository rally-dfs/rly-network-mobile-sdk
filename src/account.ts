import { Wallet, utils, BigNumber } from 'ethers';
import KeyManager from './keyManager';

let _cachedWallet: Wallet | undefined;

export type TransactionRequest = {
  to?: string;
  from?: string;
  nonce?: string | number | bigint | BigNumber | ArrayLike<number>;

  gasLimit?: string | number | bigint | BigNumber | ArrayLike<number>;
  gasPrice?: string | number | bigint | BigNumber | ArrayLike<number>;

  data?: string | ArrayLike<number>;
  value?: string | number | bigint | BigNumber | ArrayLike<number>;
  chainId?: number;

  maxPriorityFeePerGas?:
    | string
    | number
    | bigint
    | BigNumber
    | ArrayLike<number>;
  maxFeePerGas?: string | number | bigint | BigNumber | ArrayLike<number>;
};

export async function createAccount(overwrite?: boolean) {
  const existingWallet = await getWallet();

  if (existingWallet && !overwrite) {
    throw 'Account already exists';
  }

  const mnemonic = await KeyManager.generateMnemonic();
  await KeyManager.saveMnemonic(mnemonic);
  const pkey = await KeyManager.getPrivateKeyFromMnemonic(mnemonic);
  const newWallet = new Wallet(pkey);

  _cachedWallet = newWallet;

  return newWallet.address;
}

export async function getWallet() {
  if (_cachedWallet) {
    return _cachedWallet;
  }

  const mnemonic = await KeyManager.getMnemonic();

  if (!mnemonic) {
    return;
  }

  const pkey = await KeyManager.getPrivateKeyFromMnemonic(mnemonic);
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
    return await KeyManager.getMnemonic();
  } catch (error) {
    return;
  }
}

export async function signMessage(message: string): Promise<string> {
  const wallet = await getWallet();

  if (!wallet) {
    throw 'No account';
  }

  return wallet.signMessage(message);
}

export async function signTransaction(tx: TransactionRequest): Promise<string> {
  const wallet = await getWallet();
  if (!wallet) {
    throw 'No account';
  }

  return wallet.signTransaction(tx);
}

export async function signHash(hash: string): Promise<string> {
  const wallet = await getWallet();
  if (!wallet) {
    throw 'No account';
  }
  const signingKey = new utils.SigningKey(wallet.privateKey);

  return utils.joinSignature(signingKey.signDigest(hash));
}
