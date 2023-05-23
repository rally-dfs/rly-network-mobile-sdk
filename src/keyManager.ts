import { NativeModules } from 'react-native';
import type { KeychainAccessibilityConstant } from './keyManagerConstants';

interface KeyManager {
  getMnemonic: () => Promise<string | null>;
  generateMnemonic: () => Promise<string>;
  saveMnemonic: (mnemonic: string, keychainAccessible?: KeychainAccessibilityConstant) => Promise<void>;
  deleteMnemonic: () => Promise<void>;
  getPrivateKeyFromMnemonic: (mnemonic: string) => Promise<Uint8Array>;
}

const keyManager: KeyManager = NativeModules.RlyNetworkMobileSdk
  ? require('./keyManagerNativeModule')
  : require('./keyManagerExpo');

export default keyManager;
