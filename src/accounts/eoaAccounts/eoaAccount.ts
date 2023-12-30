import type { Wallet } from 'ethers';
import type { Network } from '../../network';
import { eoaAccountManager } from './eoaAccountManager';
import type { MetaTxMethod, PrefixedHexString } from '../../gsnClient/utils';

export class EoaAccount {
  private network;
  public wallet;
  constructor(wallet?: Wallet, network?: Network) {
    this.network = network;
    this.wallet = wallet;
  }
  static async getExistingOrCreate(network?: Network) {
    await eoaAccountManager.createAccount();
    const wallet = await eoaAccountManager.getWallet();
    return new EoaAccount(wallet, network);
  }
  getAddress = eoaAccountManager.getAccount;
  getWallet = eoaAccountManager.getWallet;
  importExistingAccount = eoaAccountManager.importExistingAccount;
  permanentlyDeleteAccount = eoaAccountManager.permanentlyDeleteAccount;
  getAccountPhrase = eoaAccountManager.getAccountPhrase;
  signMessage = eoaAccountManager.signMessage;
  signTransaction = eoaAccountManager.signTransaction;
  signHash = eoaAccountManager.signHash;
  signTypedData = eoaAccountManager.signTypedData;
  transfer(
    destinationAddress: string,
    amount: number,
    tokenAddress?: PrefixedHexString,
    metaTxMethod?: MetaTxMethod
  ): Promise<string> {
    if (!this.network) {
      throw new Error(
        'EOA must be initialized with a network to use this method'
      );
    }
    return this.network.transfer(
      destinationAddress,
      amount,
      tokenAddress,
      metaTxMethod
    );
  }
  async getBalance(tokenAddress?: PrefixedHexString): Promise<number> {
    if (!this.network) {
      throw new Error(
        'EOA must be initialized with a network to use this method'
      );
    }
    return this.network.getBalance(tokenAddress);
  }
  async getDisplayBalance(
    tokenAddress?: PrefixedHexString | undefined
  ): Promise<number> {
    if (!this.network) {
      throw new Error(
        'EOA must be initialized with a network to use this method'
      );
    }
    return this.network.getDisplayBalance(tokenAddress);
  }
  async getExactBalance(
    tokenAddress?: PrefixedHexString | undefined
  ): Promise<string> {
    if (!this.network) {
      throw new Error(
        'EOA must be initialized with a network to use this method'
      );
    }
    return this.network.getExactBalance(tokenAddress);
  }
  async claimRly() {
    if (!this.network) {
      throw new Error(
        'EOA must be initialized with a network to use this method'
      );
    }
    return this.network.claimRly();
  }
}
