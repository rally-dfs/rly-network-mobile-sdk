import type { GSNConfig } from '@opengsn/common';

export interface NetworkConfig {
  rpcUrl: string;
  contracts: {
    paymaster: string;
    tokenFaucet: string;
  };
  gsn: GSNConfig;
}

export * from './network_config_local';
