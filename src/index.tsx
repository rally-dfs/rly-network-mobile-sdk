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
export * from './network';
