import { Wallet, utils, BigNumber } from 'ethers';
import type { TypedDataDomain, TypedDataField } from 'ethers';
import KeyManager from './keyManager';
import type { KeyStorageConfig } from './keyManagerTypes';

let _cachedWallet: Wallet | undefined;

export type CreateAccountOptions = {
  overwrite?: boolean;
  storageOptions?: KeyStorageConfig;
};

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

async function _saveAccount(
  mnemonicPromise: Promise<string>,
  options: CreateAccountOptions = {}
) {
  const overwrite = options.overwrite || false;

  let existingWallet;
  try {
    existingWallet = await getWallet();
  } catch (error: any) {
    // if overwrite = true then just ignore the error and proceed to overwrite
    if (!overwrite) {
      throw new Error(`Error while reading existing wallet: ${error.message}`);
    }
    existingWallet = undefined;
  }

  const storageOptions = options.storageOptions || {
    saveToCloud: true,
    rejectOnCloudSaveFailure: false,
  };

  if (existingWallet && !overwrite) {
    throw new Error('Account already exists');
  }

  const mnemonic = await mnemonicPromise;
  // get pkey to check for a valid mnemonic first before passing anything invalid into saveMnemonic
  const pkey = await KeyManager.getPrivateKeyFromMnemonic(mnemonic);
  await KeyManager.saveMnemonic(mnemonic, storageOptions);
  const newWallet = new Wallet(pkey);

  _cachedWallet = newWallet;

  return newWallet.address;
}

export async function createAccount(options: CreateAccountOptions = {}) {
  return await _saveAccount(KeyManager.generateMnemonic(), options);
}

export async function importExistingAccount(
  mnemonic: string,
  options: CreateAccountOptions = {}
) {
  return await _saveAccount(Promise.resolve(mnemonic), options);
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

export async function permanentlyDeleteAccount(): Promise<void> {
  await KeyManager.deleteMnemonic();
  _cachedWallet = undefined;
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
    throw new Error('No account');
  }

  return wallet.signMessage(message);
}

export async function signTransaction(tx: TransactionRequest): Promise<string> {
  const wallet = await getWallet();
  if (!wallet) {
    throw new Error('No account');
  }

  return wallet.signTransaction(tx);
}

export async function signHash(hash: string): Promise<string> {
  const wallet = await getWallet();
  if (!wallet) {
    throw new Error('No account');
  }
  const signingKey = new utils.SigningKey(wallet.privateKey);

  return utils.joinSignature(signingKey.signDigest(hash));
}

export async function signTypedData(
  domain: TypedDataDomain,
  types: Record<string, TypedDataField[]>,
  value: Record<string, any>
): Promise<string> {
  const wallet = await getWallet();
  if (!wallet) {
    throw new Error('No account');
  }
  return await wallet._signTypedData(domain, types, value);
}

export const EoaAccountManager = {
  createAccount: createAccount,
  getAccount: getAccount,
  getWallet: getWallet,
  importExistingAccount: importExistingAccount,
  permanentlyDeleteAccount: permanentlyDeleteAccount,
  getAccountPhrase: getAccountPhrase,
  signMessage: signMessage,
  signTransaction: signTransaction,
  signHash: signHash,
  signTypedData: signTypedData,
};
