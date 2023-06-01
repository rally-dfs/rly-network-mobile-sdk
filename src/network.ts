import { getEvmNetwork } from './networks/evm_network';
import {
  MumbaiNetworkConfig,
  LocalNetworkConfig,
  PolygonNetworkConfig,
} from './network_config/network_config';

export interface Network {
  getBalance: () => Promise<number>;
  transfer: (destinationAddress: string, amount: number) => Promise<string>;
  registerAccount: () => Promise<string>;
}

export const RlyMumbaiNetwork: Network = getEvmNetwork(MumbaiNetworkConfig);
export const RlyLocalNetwork: Network = getEvmNetwork(LocalNetworkConfig);
export const RlyPolygonNetwork: Network = getEvmNetwork(PolygonNetworkConfig);
export * from './networks/dummy_network';
