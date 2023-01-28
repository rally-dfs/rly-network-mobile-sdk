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

/* https://github.com/expo/expo/blob/1bed2683739276f6392d52af48a487a0a4a99928/packages/expo-modules-core/src/requireNativeModule.ts*/

type ExpoObject = {
  modules:
    | undefined
    | {
        [key: string]: any;
      };
};

declare global {
  // eslint-disable-next-line no-var
  var expo: ExpoObject | undefined;

  /**
   * @deprecated `global.ExpoModules` is deprecated, use `global.expo.modules` instead.
   */
  // eslint-disable-next-line no-var
  var ExpoModules:
    | undefined
    | {
        [key: string]: any;
      };
}

export const NativeCodeWrapper = {
  hello: (): Promise<string> => {
    if (NativeModules.RlyNetworkMobileSdk) {
      return RlyNativeModule.hello();
    } else {
      return new Promise((resolve) => resolve('Hello World'));
    }
  },
  getBundleId: (): Promise<string> => {
    // Bare RN
    if (NativeModules.RlyNetworkMobileSdk) {
      return RlyNativeModule.getBundleId().then();
      // Expo SDK 48+
    } else if (global.expo?.modules) {
      return new Promise((resolve) =>
        resolve(
          global.expo?.modules?.NativeModulesProxy.modulesConstants
            .ExpoApplication.applicationId
        )
      );
      // Expo SDK 45+
    } else if (global.ExpoModules) {
      return new Promise((resolve) =>
        resolve(
          global.ExpoModules?.NativeModulesProxy.modulesConstants
            .ExpoApplication.applicationId
        )
      );
    } else {
      return new Promise((resolve) => resolve('bundle not found'));
    }
  },
};
