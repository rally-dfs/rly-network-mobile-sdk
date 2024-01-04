import { NativeModules } from 'react-native';
import type { KeyManager } from './keyManager.types';

const keyManager: KeyManager = NativeModules.RlyNetworkMobileSdk
  ? require('./keyManagerNativeModule')
  : require('./keyManagerExpo');

export default keyManager;
