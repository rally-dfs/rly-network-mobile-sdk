import { utils, Wallet } from 'ethers';
import type { KeyStorageConfig } from './key_storage_config';

type ExpoObject = {
  modules: undefined | { [key: string]: any };
};

declare global {
  var expo: ExpoObject | undefined;
  var ExpoModules: undefined | { [key: string]: any };
}

const LINKING_ERROR =
  "The package 'expo-secure-store' doesn't seem to be available please install it as a dependency if using expo.";

type KeychainAccessibilityConstant = number;

const WHEN_UNLOCKED: KeychainAccessibilityConstant = 5;
const WHEN_UNLOCKED_THIS_DEVICE_ONLY: KeychainAccessibilityConstant = 6;

type SecureStoreOptions = {
  keychainService?: string;
  requireAuthentication?: boolean;
  authenticationPrompt?: string;
  keychainAccessible?: KeychainAccessibilityConstant;
};

let SecureStore: {
  getItemAsync: (mnemonic: string) => Promise<string | null>;
  setItemAsync: (
    key: string,
    value: string,
    options: SecureStoreOptions
  ) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
};

if (global.expo?.modules || global.ExpoModules) {
  try {
    SecureStore = require('expo-secure-store');
  } catch (e) {
    throw new Error(LINKING_ERROR);
  }
} else {
  throw new Error(LINKING_ERROR);
}

const MNEMONIC_ACCOUNT_KEY = 'BIP39_MNEMONIC';

export const getMnemonic = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(MNEMONIC_ACCOUNT_KEY);
};

/**
 * This method will always return false, as expo without prebuild does not have support for icloud keychain
 */
export const walletBackedUpToCloud = async (): Promise<boolean> => {
  return false;
};

export const generateMnemonic = async (): Promise<string> => {
  return utils.entropyToMnemonic(utils.randomBytes(24));
};

export const saveMnemonic = async (
  mnemonic: string,
  options: KeyStorageConfig = {
    saveToCloud: true,
    rejectOnCloudSaveFailure: false,
  }
): Promise<void> => {
  if (options.saveToCloud && options.rejectOnCloudSaveFailure) {
    throw new Error(
      'Cloud is not supported, please use expo prebuild if you need cloud storage'
    );
  }

  const keychainAccessible = options.saveToCloud
    ? WHEN_UNLOCKED
    : WHEN_UNLOCKED_THIS_DEVICE_ONLY;
  return SecureStore.setItemAsync(MNEMONIC_ACCOUNT_KEY, mnemonic, {
    keychainAccessible,
  });
};

export const deleteMnemonic = async (): Promise<void> => {
  return SecureStore.deleteItemAsync(MNEMONIC_ACCOUNT_KEY);
};

export const getPrivateKeyFromMnemonic = async (
  mnemonic: string
): Promise<Uint8Array> => {
  return utils.arrayify(Wallet.fromMnemonic(mnemonic).privateKey);
};
