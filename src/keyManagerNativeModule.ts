import { NativeModules, Platform } from 'react-native';

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

export const saveMnemonic = async (mnemonic: string): Promise<void> => {
  return RlyNativeModule.saveMnemonic(mnemonic);
};

export const deleteMnemonic = async (): Promise<void> => {
  return RlyNativeModule.deleteMnemonic();
};

export const getPrivateKeyFromMnemonic = async (
  mnemonic: string
): Promise<Uint8Array> => {
  let pkey = await RlyNativeModule.getPrivateKeyFromMnemonic(mnemonic);

  if (pkey.length === 33 && pkey[0] === 0x00) {
    pkey = pkey.slice(1);
  }

  return pkey;
};
