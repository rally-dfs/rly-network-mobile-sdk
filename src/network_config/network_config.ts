import type { PrefixedHexString, IntString } from '../gsnClient/utils';

export interface NetworkConfig {
  contracts: {
    tokenFaucet: PrefixedHexString;
  };
  gsn: {
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
}

export * from './network_config_local';
