import type { Wallet } from 'ethers';
import type { Network } from '../../network';
import { eoaAccountManager } from './eoaAccountManager';
import type { MetaTxMethod, PrefixedHexString } from '../../gsnClient/utils';

export class EoaAccount {
  private network;
  public wallet;
  public address;
  constructor(wallet: Wallet, network: Network) {
    this.network = network;
    this.wallet = wallet;
    this.address = wallet.address;
  }
  static async createAccount(network: Network) {
    await eoaAccountManager.createAccount();
    const wallet = await eoaAccountManager.getWallet();
    if (!wallet) {
      return 'no account';
    }
    return new EoaAccount(wallet, network);
  }
  static async getAccount(network: Network) {
    const wallet = await eoaAccountManager.getWallet();
    if (!wallet) {
      return 'no account';
    }
    return new EoaAccount(wallet, network);
  }
  static async createEoa(): Promise<Wallet | undefined> {
    await eoaAccountManager.createAccount();
    return eoaAccountManager.getWallet();
  }
  static getAddress = eoaAccountManager.getAccount;
  static getWallet = eoaAccountManager.getWallet;
  static importExistingAccount = eoaAccountManager.importExistingAccount;
  static permanentlyDeleteAccount = eoaAccountManager.permanentlyDeleteAccount;
  static getAccountPhrase = eoaAccountManager.getAccountPhrase;
  static signMessage = eoaAccountManager.signMessage;
  static signTransaction = eoaAccountManager.signTransaction;
  static signHash = eoaAccountManager.signHash;
  static signTypedData = eoaAccountManager.signTypedData;
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
