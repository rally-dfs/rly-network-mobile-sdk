import type { GSNConfig } from '@opengsn/common';
import type { NetworkConfig } from './network_config';

export const localNetworkConfig: NetworkConfig = {
  rpcUrl: 'http://localhost:8545',
  contracts: {
    paymaster: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    tokenFaucet: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
  },
  gsn: {
    paymasterAddress: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    auditorsCount: 0,
    loggerConfiguration: {
      logLevel: 'info',
    },
  } as GSNConfig,
};
