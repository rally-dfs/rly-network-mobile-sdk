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

export const NativeCodeWrapper = {
  hello: (): Promise<string> => {
    return RlyNativeModule.hello();
  },
  getBundleId: (): Promise<string> => {
    return RlyNativeModule.getBundleId();
  },
  getMnemonic: (): Promise<Uint8Array> => {
    return RlyNativeModule.getMnemonic();
  },
};
