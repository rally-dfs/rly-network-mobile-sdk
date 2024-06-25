import { Wallet, utils, BigNumber } from 'ethers';
import type { TypedDataDomain, TypedDataField } from 'ethers';
import KeyManager from './keyManager';
import type { KeyStorageConfig } from './key_storage_config';

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

/**
 * Updates the storage settings for an existing wallet.
 *
 * @param config A `KeyStorageConfig` object to specify the storage options for the wallet.
 *
 * @throws Throws an error if no wallet is found.
 * @rejects Rejects the promise if cloud save fails and `rejectOnCloudSaveFailure` is set to `true`.
 * @remarks
 * If `rejectOnCloudSaveFailure` is `false`, cloud save failure will fallback to on-device-only storage without rejecting.
 *
 * **Important Considerations:**
 *
 * - **Cloud Transition:**  When moving from `KeyStorageConfig.saveToCloud = false` to `true`, the wallet will be moved to device cloud,
 *  potentially replacing a non-cloud wallet on other devices.
 *  Ensure users are aware of this potential for overwriting data.
 * - **Device-Only Transition:** When moving from cloud to device-only storage, the wallet will be removed from cloud storage and any other devices.
 */
export async function updateWalletStorage(storageOptions: KeyStorageConfig) {
  const mnemonic = await getAccountPhrase();
  if (!mnemonic) {
    throw new Error('Can not update storage, no wallet found');
  }

  await KeyManager.saveMnemonic(mnemonic, storageOptions);

  if (!storageOptions.saveToCloud) {
    await KeyManager.deleteCloudMnemonic();
  }
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

/**
 * @deprecated This method is deprecated and will be removed in a future version. Use `walletEligibleForCloudSync` instead.
 * The naming of this method was confusing and has been deprecated in favor of walletEligibleForCloudSync.
 * Name implied a level of control over device syncing that is not possible given the operating system constraints. See walletEligibleForCloudSync for more details.
 */
export async function walletBackedUpToCloud() {
  return await KeyManager.walletBackedUpToCloud();
}

/**
 * Determines if the current wallet is eligible for OS-provided cloud backup and cross-device sync.
 *
 * @returns `true` if the wallet is stored in a way that makes it eligible for cloud backup and sync, `false` otherwise.
 *
 * @remarks
 * This does NOT guarantee that the wallet is actively backed up. It simply indicates eligibility.
 * Actual cloud backup depends on user and app-level settings for secure key storage.
 *
 * - **iOS:** Checks if the wallet will sync when iCloud Keychain sync is enabled.
 * - **Android:** Checks if the wallet is in Google Play Keystore and will sync when Google backup is enabled.
 *
 * **Important Note:**
 * Do NOT use this method to check for wallet existence. It will return `false` if no wallet is found OR if the wallet exists but isn't configured for cloud backup.
 */
export async function walletEligibleForCloudSync() {
  return await KeyManager.walletBackedUpToCloud();
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
