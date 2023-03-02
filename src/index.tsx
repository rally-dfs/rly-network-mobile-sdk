import 'react-native-get-random-values';
import '@ethersproject/shims';

export {
  getAccount,
  getAccountPhrase,
  createAccount,
  permanentlyDeleteAccount,
} from './account';
export * from './network';
