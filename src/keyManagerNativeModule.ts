import { NativeModules, Platform } from 'react-native';
import { KeychainAccessibilityConstant, WHEN_UNLOCKED } from './keyManagerConstants';

const LINKING_ERROR =
  `The package 'rly-network-mobile-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const RlyNativeModule = NativeModules.RlyNetworkMobileSdk
  ? NativeModules.RlyNetworkMobileSdk
  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );

export const getMnemonic = async (): Promise<string | null> => {
  return RlyNativeModule.getMnemonic();
};

export const generateMnemonic = async (): Promise<string> => {
  return RlyNativeModule.generateMnemonic();
};

export const saveMnemonic = async (mnemonic: string, keychainAccessible: KeychainAccessibilityConstant = WHEN_UNLOCKED): Promise<void> => {
  return RlyNativeModule.saveMnemonic(mnemonic, keychainAccessible);
};

export const deleteMnemonic = async (): Promise<void> => {
  return RlyNativeModule.deleteMnemonic();
};

export const getPrivateKeyFromMnemonic = async (
  mnemonic: string
): Promise<Uint8Array> => {
  return RlyNativeModule.getPrivateKeyFromMnemonic(mnemonic);
};
