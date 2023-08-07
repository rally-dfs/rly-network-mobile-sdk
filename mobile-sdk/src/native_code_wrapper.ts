import { ethers, BigNumber } from 'ethers';
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
  getClientId: async function (): Promise<string> {
    //get bundleId string from application convert it to integer for use in GSN
    //get bundle id from native module
    const bundleId = await this.getBundleId();
    //convert bundle to hex
    const hexValue = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(bundleId));
    //convert hex to int
    return BigNumber.from(hexValue).toString();
  },
};
