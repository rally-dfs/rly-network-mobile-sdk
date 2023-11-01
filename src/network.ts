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

export interface Network {
  getBalance: (tokenAddress?: PrefixedHexString) => Promise<number>;
  getDisplayBalance: (tokenAddress?: PrefixedHexString) => Promise<number>;
  getExactBalance: (tokenAddress?: PrefixedHexString) => Promise<string>;
  transfer: (
    destinationAddress: string,
    amount: number,
    tokenAddress?: PrefixedHexString,
    metaTxMethod?: MetaTxMethod
  ) => Promise<string>;
  transferExact: (
    destinationAddress: string,
    amount: string,
    tokenAddress?: PrefixedHexString,
    metaTxMethod?: MetaTxMethod
  ) => Promise<string>;
  claimRly: () => Promise<string>;
  //Deprecated please use claimRly instead
  registerAccount: () => Promise<string>;
  relay?: (tx: GsnTransactionDetails) => Promise<string>;
  setApiKey: (apiKey: string) => void;
}

export const RlyMumbaiNetwork: Network = getEvmNetwork(MumbaiNetworkConfig);
export const RlyLocalNetwork: Network = getEvmNetwork(LocalNetworkConfig);
export const RlyPolygonNetwork: Network = getEvmNetwork(PolygonNetworkConfig);
export * from './networks/dummy_network';
