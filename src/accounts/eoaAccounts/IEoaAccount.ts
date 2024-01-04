import type { Wallet } from 'ethers';
import type { MetaTxMethod, PrefixedHexString } from '../../gsnClient/utils';

export interface IEoaAccount {
  wallet: Wallet;
  address: string;
  transfer(
    destinationAddress: string,
    amount: number,
    tokenAddress?: PrefixedHexString,
    metaTxMethod?: MetaTxMethod
  ): Promise<string>;
  getBalance(tokenAddress?: PrefixedHexString): Promise<number>;
  getDisplayBalance(
    tokenAddress?: PrefixedHexString | undefined
  ): Promise<number>;
  getExactBalance(
    tokenAddress?: PrefixedHexString | undefined
  ): Promise<string>;
  claimRly(): Promise<any>;
}
