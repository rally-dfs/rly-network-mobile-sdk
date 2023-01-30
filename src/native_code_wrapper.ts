import { NativeModules } from 'react-native';

const RlyNativeModule =
  NativeModules.RlyNetworkMobileSdk && NativeModules.RlyNetworkMobileSdk;

// types needed for native modules
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

//from react-native-keychain
//https://github.com/oblador/react-native-keychain/blob/f3003e8208f6561a77d6fad0544d9a73a6731663/index.js#L110

type UserCredentials = {
  username: string;
  password: string;
  service: string;
  storage: string;
};

//from react-native-keychain
//https://github.com/oblador/react-native-keychain/blob/f3003e8208f6561a77d6fad0544d9a73a6731663/index.js#L121

const AUTH_PROMPT_DEFAULTS = {
  title: 'Authenticate to retrieve secret',
  cancel: 'Cancel',
};

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
  setSecureItem: (
    username: string,
    password: string,
    options: any,
    expoOpts: any = {}
  ): Promise<false | string> => {
    // Bare RN
    if (NativeModules.RNKeychainManager) {
      options.authenticationPrompt = {
        ...AUTH_PROMPT_DEFAULTS,
      };
      return NativeModules.RNKeychainManager.setGenericPasswordForOptions(
        options,
        username,
        password
      );
      // Expo SDK 48+
    } else if (global.expo?.modules) {
      const ExpoNativeProxy = global.expo?.modules?.NativeModulesProxy;
      return ExpoNativeProxy.callMethod(
        'ExpoSecureStore',
        'setValueWithKeyAsync',
        [password, username, expoOpts]
      );
    } else if (global.ExpoModules) {
      const ExpoNativeProxy = global.ExpoModules.NativeModulesProxy;
      return ExpoNativeProxy.callMethod(
        'ExpoSecureStore',
        'setValueWithKeyAsync',
        [password, username, expoOpts]
      );
    } else {
      return new Promise((resolve) => resolve(false));
    }
  },
  getSecureItem: (
    item: any,
    service: any,
    options: any = {}
  ): Promise<false | string | UserCredentials> => {
    // Bare RN
    if (NativeModules.RNKeychainManager) {
      service.authenticationPrompt = {
        ...AUTH_PROMPT_DEFAULTS,
      };
      return NativeModules.RNKeychainManager.getGenericPasswordForOptions(
        service
      );
      // Expo SDK 48+
    } else if (global.expo?.modules) {
      const ExpoNativeProxy = global.expo?.modules?.NativeModulesProxy;
      return ExpoNativeProxy.callMethod(
        'ExpoSecureStore',
        'getValueWithKeyAsync',
        [item, options]
      );
      // Expo SDK 45+
    } else if (global.ExpoModules) {
      const ExpoNativeProxy = global.ExpoModules.NativeModulesProxy;
      return ExpoNativeProxy.callMethod(
        'ExpoSecureStore',
        'getValueWithKeyAsync',
        [item, options]
      );
    }
    return new Promise((resolve) => resolve(false));
  },
};
