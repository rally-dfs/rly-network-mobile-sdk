import type { Wallet } from 'ethers';
import { getEvmNetwork } from './networks/evm_network';
import type {
  PrefixedHexString,
  GsnTransactionDetails,
  MetaTxMethod,
} from './gsnClient/utils';

import {
  MumbaiNetworkConfig,
  LocalNetworkConfig,
  PolygonNetworkConfig,
} from './network_config/network_config';

export interface CoreNetwork {
  getBalance: (
    wallet: Wallet,
    tokenAddress?: PrefixedHexString
  ) => Promise<number>;
  transfer: (
    wallet: Wallet,
    destinationAddress: string,
    amount: number,
    tokenAddress?: PrefixedHexString,
    metaTxMethod?: MetaTxMethod
  ) => Promise<string>;
  claimRly: (wallet: Wallet) => Promise<string>;
  //Deprecated please use claimRly instead
  registerAccount: (wallet: Wallet) => Promise<string>;
  relay?: (wallet: Wallet, tx: GsnTransactionDetails) => Promise<string>;
  setApiKey: (apiKey: string) => void;
}

export const RlyCoreMumbaiNetwork: CoreNetwork =
  getEvmNetwork(MumbaiNetworkConfig);
export const RlyCoreLocalNetwork: CoreNetwork =
  getEvmNetwork(LocalNetworkConfig);
export const RlyCorePolygonNetwork: CoreNetwork =
  getEvmNetwork(PolygonNetworkConfig);

export { RlyCoreDummyNetwork } from './networks/dummy_network';
