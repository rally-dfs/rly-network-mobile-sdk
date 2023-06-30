import { NativeModules } from 'react-native';
import type { KeyManager } from './keyManagerTypes';

const keyManager: KeyManager = NativeModules.RlyNetworkMobileSdk
  ? require('./keyManagerNativeModule')
  : require('./keyManagerExpo');

export default keyManager;
