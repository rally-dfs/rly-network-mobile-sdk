import type { PrefixedHexString, IntString } from '../gsnClient/utils';

export type GSNConfig = {
  paymasterAddress: PrefixedHexString;
  forwarderAddress: PrefixedHexString;
  relayHubAddress: PrefixedHexString;
  relayWorkerAddress: PrefixedHexString;
  relayUrl: string;
  rpcUrl: string;
  chainId: IntString;
  maxAcceptanceBudget: IntString;
  domainSeparatorName: string;
  gtxDataZero: number;
  gtxDataNonZero: number;
  requestValidSeconds: number;
  maxPaymasterDataLength: number;
  maxApprovalDataLength: number;
  maxRelayNonceGap: number;
};

export interface NetworkConfig {
  contracts: {
    tokenFaucet: PrefixedHexString;
    rlyERC20: PrefixedHexString;
  };
  gsn: GSNConfig;
  relayerApiKey?: string;
}

export * from './network_config_local';
export * from './network_config_test';
export * from './network_config_mumbai';
export * from './network_config_polygon';
