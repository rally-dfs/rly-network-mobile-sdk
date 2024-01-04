import {
  createAccount,
  getAccount,
  getWallet,
  importExistingAccount,
  permanentlyDeleteAccount,
  signMessage,
  signTransaction,
  getAccountPhrase,
  signHash,
  signTypedData,
} from './account';

export const eoaAccountManager = {
  createAccount: createAccount,
  getAccount: getAccount,
  getWallet: getWallet,
  importExistingAccount: importExistingAccount,
  permanentlyDeleteAccount: permanentlyDeleteAccount,
  getAccountPhrase: getAccountPhrase,
  signMessage: signMessage,
  signTransaction: signTransaction,
  signHash: signHash,
  signTypedData: signTypedData,
};
