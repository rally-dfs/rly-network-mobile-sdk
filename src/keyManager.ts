import { NativeModules } from 'react-native';

interface KeyManager {
  getMnemonic: () => Promise<string | null>;
  generateMnemonic: () => Promise<string>;
  saveMnemonic: (mnemonic: string) => Promise<void>;
  deleteMnemonic: () => Promise<void>;
  getPrivateKeyFromMnemonic: (mnemonic: string) => Promise<Uint8Array>;
}

const keyManager: KeyManager = NativeModules.RlyNetworkMobileSdk
  ? require('./keyManagerNativeModule')
  : require('./keyManagerExpo');

export default keyManager;
