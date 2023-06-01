import { getEvmNetwork } from './networks/evm_network';
import type {
  PrefixedHexString,
  GsnTransactionDetails,
} from './gsnClient/utils';

import {
  MumbaiNetworkConfig,
  LocalNetworkConfig,
  PolygonNetworkConfig,
} from './network_config/network_config';

export interface Network {
  getBalance: (tokenAddress?: PrefixedHexString) => Promise<number>;
  transfer: (
    destinationAddress: string,
    amount: number,
    tokenAddress?: PrefixedHexString
  ) => Promise<string>;
  registerAccount: () => Promise<string>;
  relay: (tx: GsnTransactionDetails) => Promise<string>;
}

export const RlyMumbaiNetwork: Network = getEvmNetwork(MumbaiNetworkConfig);
export const RlyLocalNetwork: Network = getEvmNetwork(LocalNetworkConfig);
export const RlyPolygonNetwork: Network = getEvmNetwork(PolygonNetworkConfig);
export * from './networks/dummy_network';
