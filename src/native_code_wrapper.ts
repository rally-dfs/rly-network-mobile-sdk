import { NativeModules } from 'react-native';

const RlyNativeModule =
  NativeModules.RlyNetworkMobileSdk && NativeModules.RlyNetworkMobileSdk;

type ExpoObject = {
  modules: undefined | { [key: string]: any };
};

declare global {
  var expo: ExpoObject | undefined;
  var ExpoModules: undefined | { [key: string]: any };
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
