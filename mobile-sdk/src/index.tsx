import 'react-native-get-random-values';
import '@ethersproject/shims';

export {
  getAccount,
  getAccountPhrase,
  createAccount,
  signMessage,
  signTransaction,
  signHash,
  permanentlyDeleteAccount,
} from './account';
export { MetaTxMethod } from '@rly-network/core-sdk';
export * from './coreNetworkWrapper';
